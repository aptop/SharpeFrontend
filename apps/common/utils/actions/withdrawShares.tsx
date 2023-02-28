import {ethers} from 'ethers';
import axios from 'axios';
const StEthVault = require('../abi/StEthVault.sol/StEthVault.json');

import type {ContractInterface} from 'ethers';


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

export async function	withdrawShares(
	provider: ethers.providers.Web3Provider,
	vaultAddress: string,
	maxShares: ethers.BigNumber
): Promise<boolean> {
	const	signer = provider.getSigner();
	let receiver = await signer.getAddress();
	let sharpeLensAddress = "0x2b639Cc84e1Ad3aA92D4Ee7d2755A6ABEf300D72";

	const sharpeLens = new ethers.Contract(
		sharpeLensAddress,
		["function previewSwap(uint shares)external view returns(uint)"],
		provider
	);

	const swapAmount = await sharpeLens.previewSwap(maxShares);

	const data = await fetchSwapData({
		fromTokenAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
		toTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
		amount: swapAmount.toString(),
		fromAddress: vaultAddress,
		slippage: 1,
		disableEstimate: true,
		compatibilityMode: true
	});

	try {
		const	contract = new ethers.Contract(
			vaultAddress,
			StEthVault.abi,
			signer
		);
		const transaction = await contract.withdraw(maxShares.toString(), receiver, receiver, data.tx.data);
		const transactionResult = await transaction.wait();
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
