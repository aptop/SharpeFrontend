import React, {useMemo, useState, useCallback, useEffect} from 'react';
import {ethers} from "ethers"
import Link from 'next/link';
import CloneEl from "../../../../pages/vaults/[chainID]/StEth"
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ETH_TOKEN_ADDRESS, WETH_TOKEN_ADDRESS, WFTM_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';
import {toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {ImageWithFallback} from '@common/components/ImageWithFallback';
import {useBalance} from '@common/hooks/useBalance';
import {formatPercent, formatUSD, getVaultName} from '@common/utils';
import {useTokenPrice} from '@common/hooks/useTokenPrice';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {formatToNormalizedValue} from '@yearn-finance/web-lib/utils/format.bigNumber';

import {formatCounterValue} from '@yearn-finance/web-lib/utils/format.value';
import {getProvider} from '@yearn-finance/web-lib/utils/web3/providers';

import type {BigNumber} from 'ethers';
import type {ReactElement} from 'react';
import type {TYearnVault} from '@common/types/yearn';

function	VaultsListRow({currentVault}: {currentVault: TYearnVault}): ReactElement {
	const {address, provider} = useWeb3();
	const {safeChainID} = useChainID();
	const [tvlValue, set_tvlValue] = useState("");
	const balanceOfWant = useBalance(currentVault.token.address);
	const balanceOfCoin = useBalance(ETH_TOKEN_ADDRESS);
	const balanceOfWrappedCoin = useBalance(toAddress(currentVault.token.address) === WFTM_TOKEN_ADDRESS ? WFTM_TOKEN_ADDRESS : WETH_TOKEN_ADDRESS);
	const deposited = useBalance(currentVault.address)?.normalized;
	const vaultName = useMemo((): string => getVaultName(currentVault), [currentVault]);

	const tvlFetcher = useCallback(async (): Promise<{raw: BigNumber, normalized: number}> => {
		
		const	currentProvider = provider || getProvider(safeChainID);
		const	contract = new ethers.Contract(
			currentVault.address,
			['function getVaultsActualBalance() public view returns (uint)'],
			currentProvider
		);

		try {
			const	getVaultsActualBalance = await contract.getVaultsActualBalance() || ethers.constants.Zero;
			const	effectiveAllowance = ({
				raw: getVaultsActualBalance,
				normalized: formatToNormalizedValue(getVaultsActualBalance || ethers.constants.Zero, currentVault?.decimals)
			});
			return effectiveAllowance;
		} catch (error) {
			return ({raw: ethers.constants.Zero, normalized: 0});
		}
	}, [address, currentVault?.decimals, provider, safeChainID]);

	const selectedOptionFromPricePerToken = useTokenPrice(toAddress(currentVault.token.address));

	useEffect(() => {
		const getter = async () => {
			let {raw} = await tvlFetcher();
			set_tvlValue(raw.toString())
		}
		getter()
	}, []);

	const availableToDeposit = useMemo((): number => {
		// Handle ETH native coin
		if (toAddress(currentVault.token.address) === WETH_TOKEN_ADDRESS) {
			return (balanceOfWrappedCoin.normalized + balanceOfCoin.normalized);
		}
		if (toAddress(currentVault.token.address) === WFTM_TOKEN_ADDRESS) {
			return (balanceOfWrappedCoin.normalized + Number(toNormalizedBN(balanceOfCoin.raw, 18).normalized));
		}
		return balanceOfWant.normalized;
	}, [balanceOfCoin.normalized, balanceOfCoin.raw, balanceOfWant.normalized, balanceOfWrappedCoin.normalized, currentVault.token.address]);
	
	return (
		<Link key={`${currentVault.address}`} href={`/vaults/${safeChainID}/StEth`}>
			<div className={'yearn--table-wrapper cursor-pointer transition-colors hover:bg-neutral-300'}>
				<div className={'yearn--table-token-section'}>
					<div className={'yearn--table-token-section-item'}>
						<div className={'yearn--table-token-section-item-image'}>
							<ImageWithFallback
								alt={vaultName}
								width={40}
								height={40}
								quality={90}
								src={`${process.env.BASE_YEARN_ASSETS_URI}/${safeChainID}/${toAddress(currentVault.token.address)}/logo-128.png`}
								loading={'eager'} />
						</div>
						<p>{vaultName}</p>
					</div>
				</div>

				<div className={'yearn--table-data-section'}>
					<div className={'yearn--table-data-section-item md:col-span-2'} datatype={'number'}>
						<label className={'yearn--table-data-section-item-label !font-aeonik'}>{'APY'}</label>
						<b className={'yearn--table-data-section-item-value'}>
							{(currentVault.apy?.type === 'new' && currentVault.apy?.net_apy == 0) ? (
								'New'
							) : (currentVault.apy?.net_apy || 0) > 5 ? (
								`≧ ${formatPercent(500)}`
							) : (
								formatPercent((currentVault.apy?.net_apy || 0) * 100)
							)}
						</b>
					</div>

					<div className={'yearn--table-data-section-item md:col-span-2'} datatype={'number'}>
						<label className={'yearn--table-data-section-item-label !font-aeonik'}>{'Available'}</label>
						<p className={`yearn--table-data-section-item-value ${availableToDeposit === 0 ? 'text-neutral-400' : 'text-neutral-900'}`}>
							{formatAmount(availableToDeposit)}
						</p>
					</div>

					<div className={'yearn--table-data-section-item md:col-span-2'} datatype={'number'}>
						<label className={'yearn--table-data-section-item-label !font-aeonik'}>{'Deposited'}</label>
						<p className={`yearn--table-data-section-item-value ${deposited === 0 ? 'text-neutral-400' : 'text-neutral-900'}`}>
							{formatAmount(deposited)}
						</p>
					</div>

					<div className={'yearn--table-data-section-item md:col-span-2'} datatype={'number'}>
						<label className={'yearn--table-data-section-item-label !font-aeonik'}>{'TVL'}</label>
						<p className={'yearn--table-data-section-item-value'}>
							{formatCounterValue(formatToNormalizedValue(tvlValue || ethers.constants.Zero, currentVault.token.decimals) || 0, selectedOptionFromPricePerToken)}
						</p>
					</div>
				</div>
			</div>
		</Link>
	);
}

export {VaultsListRow};
