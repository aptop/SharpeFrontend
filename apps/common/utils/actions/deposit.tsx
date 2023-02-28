import {ethers} from 'ethers';
import axios from 'axios';
import {BigNumber} from 'ethers';

function calAaveFee( b: BigNumber, is2x:boolean): BigNumber {
	try{
		if (b == null || b.isZero()) {
			return BigNumber.from(0);
		}
		const bFloat = parseFloat(ethers.utils.formatEther(b));
	
		if (isNaN(bFloat)) {
			return BigNumber.from(0);
		}
		let multiplier;
		if(is2x == false) multiplier = 1.0018;
		else multiplier = 1.0009;
		const amountWithFee =  bFloat * multiplier;
	
		return ethers.utils.parseEther(amountWithFee.toFixed(18));
	}
	catch{
		throw("error")
	}
    
}

interface SwapData {
    fromTokenAddress: string;
    toTokenAddress: string;
    amount: string;
    fromAddress: string;
    slippage: number;
    disableEstimate: boolean;
    compatibilityMode: boolean;
}

async function fetchSwapData(swapData: SwapData): Promise<any> {
    try {
        const response = await axios.get(
            `https://api.1inch.io/v5.0/1/swap?fromTokenAddress=${swapData.fromTokenAddress}&toTokenAddress=${swapData.toTokenAddress}&amount=${swapData.amount}&fromAddress=${swapData.fromAddress}&slippage=${swapData.slippage}&disableEstimate=${swapData.disableEstimate}&compatibilityMode=${swapData.compatibilityMode}`
        );
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function deposit(
	provider: ethers.providers.Web3Provider,
	vaultAddress: string,
	amount: BigNumber
): Promise<boolean> {
	const	signer = provider.getSigner();

	const	contract1 = new ethers.Contract(
		vaultAddress,
		['function vaultsLeverage() external view returns (uint8)'],
		provider
	);
	let leverage:number = await contract1.vaultsLeverage();
	let swapAmount, amountWithFee : BigNumber;

	if(leverage == 0){
		amountWithFee = amount
		swapAmount = amount
	}
	else{
		let is2x:boolean = leverage == 1 ? true : false;
		amountWithFee = calAaveFee(amount, is2x);

		let bFloat = parseFloat(ethers.utils.formatEther(amount));
		bFloat = is2x == false ? bFloat * 3 : bFloat * 2;
		swapAmount = ethers.utils.parseEther(bFloat.toFixed(18));
	} 

	const data = await fetchSwapData({
		fromTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		toTokenAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
		amount: swapAmount.toString(),
		fromAddress: vaultAddress,
		slippage: 1,
		disableEstimate: true,
		compatibilityMode: true
	});

	let receiver = await signer.getAddress();
	
	try {
		const	contract = new ethers.Contract(
			vaultAddress,
			['function deposit(uint256 assets, address receiver, bytes calldata _data1) external payable nonReentrant override returns (uint256 shares)'],
			signer
		);

		const	transaction = await contract.deposit(amount.toString(), receiver, data.tx.data, {value: amountWithFee.toString()});
		const	transactionResult = await transaction.wait();
		if (transactionResult.status === 0) {
			console.error('Fail to perform transaction');
			return false;
		}

		return true;
	} catch(error) {
		console.error(error);
		return false;
	}
}
