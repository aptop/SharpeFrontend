import React, {Fragment, useCallback, useMemo, useState} from 'react';
import {ethers} from 'ethers';
import VaultListOptions from '@vaults/components/list/VaultListOptions';
import {VaultsListEmpty} from '@vaults/components/list/VaultsListEmpty';
import {VaultsListInternalMigrationRow} from '@vaults/components/list/VaultsListInternalMigrationRow';
import {VaultsListRow} from '@vaults/components/list/VaultsListRow';
import {useAppSettings} from '@vaults/contexts/useAppSettings';
import {useVaultsMigrations} from '@vaults/contexts/useVaultsMigrations';
import {useWalletForInternalMigrations} from '@vaults/contexts/useWalletForInternalMigrations';
import {useFilteredVaults} from '@vaults/hooks/useFilteredVaults';
import {useSortVaults} from '@vaults/hooks/useSortVaults';
import Wrapper from '@vaults/Wrapper';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import performBatchedUpdates from '@yearn-finance/web-lib/utils/performBatchedUpdates';
import ListHead from '@common/components/ListHead';
import ListHero from '@common/components/ListHero';
import ValueAnimation from '@common/components/ValueAnimation';
import {useWallet} from '@common/contexts/useWallet';
import {useYearn} from '@common/contexts/useYearn';
import {getVaultName} from '@common/utils';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import type {TAddress} from '@yearn-finance/web-lib/utils/address';
import type {NextRouter} from 'next/router';
import type {ReactElement, ReactNode} from 'react';
import type {TYearnVault} from '@common/types/yearn';
import type {TPossibleSortBy, TPossibleSortDirection} from '@vaults/hooks/useSortVaults';

function	HeaderUserPosition(): ReactElement {
	const	{cumulatedValueInVaults} = useWallet();
	const	{cumulatedValueInVaults: cumulatedValueInDeprecatedVaults} = useWalletForInternalMigrations();
	const	{earned} = useYearn();

	const	formatedYouEarned = useMemo((): string => formatAmount(earned?.totalUnrealizedGainsUSD || 0), [earned]);
	const	formatedYouHave = useMemo((): string => (
		formatAmount(cumulatedValueInVaults + cumulatedValueInDeprecatedVaults)
	), [cumulatedValueInVaults, cumulatedValueInDeprecatedVaults]);

	return (
		<Fragment>
			<div className={'col-span-12 w-full md:col-span-8'}>
				<p className={'pb-2 text-lg text-neutral-900 md:pb-6 md:text-3xl'}>{'Deposited'}</p>
				<b className={'font-number text-4xl text-neutral-900 md:text-7xl'}>
					<ValueAnimation
						identifier={'youHave'}
						value={formatedYouHave}
						defaultValue={formatAmount(0)}
						prefix={'$'} />
				</b>
			</div>
			<div className={'col-span-12 w-full md:col-span-4'}>
				<p className={'pb-2 text-lg text-neutral-900 md:pb-6 md:text-3xl'}>{'Earnings'}</p>
				<b className={'font-number text-3xl text-neutral-900 md:text-7xl'}>
					<ValueAnimation
						identifier={'youEarned'}
						value={formatedYouEarned ? formatedYouEarned : ''}
						defaultValue={formatAmount(0)}
						prefix={'$'} />
				</b>
			</div>
		</Fragment>
	);
}

function	Index(): ReactElement {
	const	{balances} = useWallet();
	const {safeChainID} = useChainID();
	const	{vaults, isLoadingVaultList} = useYearn();
	const	{possibleVaultsMigrations, isLoading: isLoadingVaultsMigrations} = useVaultsMigrations();
	const	{balances: internalMigrationsBalances} = useWalletForInternalMigrations();
	const	[sortBy, set_sortBy] = useState<TPossibleSortBy>('apy');
	const	[sortDirection, set_sortDirection] = useState<TPossibleSortDirection>('');
	const	{shouldHideDust, shouldHideLowTVLVaults, category, searchValue, set_category, set_searchValue} = useAppSettings();
	
	/* 🔵 - Yearn Finance **************************************************************************
	**	It's best to memorize the filtered vaults, which saves a lot of processing time by only
	**	performing the filtering once.
	**********************************************************************************************/
	const	curveVaults = useFilteredVaults(vaults, ({category}): boolean => category === 'Curve');
	const	stablesVaults = useFilteredVaults(vaults, ({category}): boolean => category === 'Stablecoin');
	const	balancerVaults = useFilteredVaults(vaults, ({category}): boolean => category === 'Balancer');
	const	cryptoVaults = useFilteredVaults(vaults, ({category}): boolean => category === 'Volatile');
	const	holdingsVaults = useFilteredVaults(vaults, ({address}): boolean => {
		const	holding = balances?.[toAddress(address)];
		const	hasValidBalance = (holding?.raw || ethers.constants.Zero).gt(0);
		const	balanceValue = holding?.normalizedValue || 0;
		if (shouldHideDust && balanceValue < 0.01) {
			return false;
		} if (hasValidBalance) {
			return true;
		}
		return false;
	});
	const	migratableVaults = useFilteredVaults(possibleVaultsMigrations, ({address}): boolean => {
		const	holding = internalMigrationsBalances?.[toAddress(address)];
		const	hasValidPrice = (holding?.rawPrice || ethers.constants.Zero).gt(0);
		const	hasValidBalance = (holding?.raw || ethers.constants.Zero).gt(0);
		if (hasValidBalance && (hasValidPrice ? (holding?.normalizedValue || 0) >= 0.01 : true)) {
			return true;
		}
		return false;
	});

	/* 🔵 - Yearn Finance **************************************************************************
	**	First, we need to determine in which category we are. The vaultsToDisplay function will
	**	decide which vaults to display based on the category. No extra filters are applied.
	**	The possible lists are memoized to avoid unnecessary re-renders.
	**********************************************************************************************/
	const	vaultsToDisplay = useMemo((): TYearnVault[] => {
		let	_vaultList: TYearnVault[] = [...Object.values(vaults || {})] as TYearnVault[];

		if (category === 'Curve Vaults') {
			_vaultList = curveVaults;
		} else if (category === 'Balancer Vaults') {
			_vaultList = balancerVaults;
		} else if (category === 'Stables Vaults') {
			_vaultList = stablesVaults;
		} else if (category === 'Crypto Vaults') {
			_vaultList = cryptoVaults;
		} else if (category === 'Holdings') {
			_vaultList = holdingsVaults;
		} else if (category === 'Featured Vaults') {
			_vaultList.sort((a, b): number => ((b.tvl.tvl || 0) * (b?.apy?.net_apy || 0)) - ((a.tvl.tvl || 0) * (a?.apy?.net_apy || 0)));
			_vaultList = _vaultList.slice(0, 10);
		}

		if (shouldHideLowTVLVaults && category !== 'Holdings') {
			_vaultList = _vaultList.filter((vault): boolean => (vault?.tvl?.tvl || 0) > 10_000);
		}

		return _vaultList;
	}, [vaults, category, shouldHideLowTVLVaults, curveVaults, balancerVaults, stablesVaults, cryptoVaults, holdingsVaults]);

	/* 🔵 - Yearn Finance **************************************************************************
	**	Then, on the vaultsToDisplay list, we apply the search filter. The search filter is
	**	implemented as a simple string.includes() on the vault name.
	**********************************************************************************************/
	const	searchedVaultsToDisplay = useMemo((): TYearnVault[] => {
		const	vaultsToUse = [...vaultsToDisplay];

		if (searchValue === '') {
			return vaultsToUse;
		}
		return vaultsToUse.filter((vault): boolean => {
			const	searchString = getVaultName(vault);
			return searchString.toLowerCase().includes(searchValue.toLowerCase());
		});
	}, [vaultsToDisplay, searchValue]);

	/* 🔵 - Yearn Finance **************************************************************************
	**	Then, once we have reduced the list of vaults to display, we can sort them. The sorting
	**	is done via a custom method that will sort the vaults based on the sortBy and
	**	sortDirection values.
	**********************************************************************************************/
	let	sortedVaultsToDisplay = useSortVaults([...searchedVaultsToDisplay], sortBy, sortDirection);
	let vaultAddress : TAddress = toAddress("0x6463cF638a3F2b835B60Fc1f97a95209F92F5d4F")
	console.log("vaultsList::: ", searchedVaultsToDisplay[1])
	// searchedVaultsToDisplay[0].address = vaultAddress;
	let vaultData = safeChainID == 1 ? JSON.parse('{ "address": "0x73C68f1f41e4890D06Ba3e71b9E9DfA555f1fb46", "type": "Standard", "symbol": "-Eth", "display_symbol": "Sharp-Eth", "formated_symbol": "Sharp-Eth", "name": "Staked Eth Vault", "display_name": "ETH", "formated_name": "Staked Eth Vault", "icon": "https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0x27B5739e22ad9033bcBf192059122d163b60349D/logo-128.png", "version": "0.4.3", "category": "Curve", "inception": 1664285315, "decimals": 18, "chainID": 1, "riskScore": 0, "endorsed": true, "emergency_shutdown": false, "token": { "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", "name": "Ether", "symbol": "ETH", "type": "", "display_name": "Yearn CRV", "display_symbol": "yCRV", "description": "MagETH is built on top of ETH, the Ethereum Blockchains native token. MagETH is a vault that allows users to leverage their staked ETH position on Lido stETH through Aave Flashloans and p2p lending infrastructure Morpho, maximising user returns while ensuring healthy collateral and leverage.", "icon": "https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0xFCc5c47bE19d06BF83eB04298b026F81069ff65b/logo-128.png", "decimals": 18 }, "tvl": { "total_assets": "24343110003314565819591808", "total_delegated_assets": "0", "tvl_deposited": 25755497.24570688, "tvl_delegated": 0, "tvl": 25755497.24570688, "price": 1.05802 }, "apy": { "type": "v2:averaged", "gross_apr": 0.4701175305298714, "net_apy": 0.11, "fees": { "performance": 0.1, "withdrawal": 0, "management": 0, "keep_crv": 0, "cvx_keep_crv": 0 }, "points": { "week_ago": 0.31081499718718986, "month_ago": 0.5240842324796011, "inception": 0.45349266414383815 }, "composite": { "boost": 0, "pool_apy": 0, "boosted_apr": 0, "base_apr": 0, "cvx_apr": 0, "rewards_apr": 0 } }, "details": { "management": "0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7", "governance": "0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52", "guardian": "0x846e211e8ba920B353FB717631C015cf04061Cc9", "rewards": "0x93A62dA5a14C80f265DAbC077fCEE437B1a0Efde", "depositLimit": "100000000000000000000000000", "availableDepositLimit": "75656889996685434180408192", "comment": "st-yCRV", "apyTypeOverride": "", "apyOverride": 0, "order": 110, "performanceFee": 1000, "managementFee": 0, "depositsDisabled": false, "withdrawalsDisabled": false, "allowZapIn": false, "allowZapOut": false, "retired": false, "hideAlways": false }, "strategies": [ { "address": "0xAf73A48E1d7e8300C91fFB74b8f5e721fBFC5873", "name": "StrategyStYCRV", "description": "Accepts {{token}} to earn a continuous share of [Curve Finance](https://curve.fi) fees and Curve DAO voting bribes. Earned [3Crv](https://curve.fi/3pool) (Curves 3pool LP token) fees and rewards are harvested, swapped for more {{token}} which is deposited back into the strategy. Swap happens either via market-buy or mint, depending which is more capital efficient.", "details": { "keeper": "0x736D7e3c5a6CB2CE3B764300140ABF476F6CFCCF", "strategist": "0x0B634A8D61b09820E9F72F79cdCBc8A4D0Aad26b", "rewards": "0x0B634A8D61b09820E9F72F79cdCBc8A4D0Aad26b", "healthCheck": "0x0000000000000000000000000000000000000000", "totalDebt": "0", "totalLoss": "0", "totalGain": "934603273941638367854827", "minDebtPerHarvest": "0", "maxDebtPerHarvest": "115792089237316195423570985008687907853269984665640564039457584007913129639935", "estimatedTotalAssets": "30000000000000000000000", "creditAvailable": "0", "debtOutstanding": "0", "expectedReturn": "56773198154063704678774", "delegatedAssets": "0", "delegatedValue": "0", "version": "0.4.3", "protocols": [ "Curve Finance" ], "apr": 0, "performanceFee": 0, "lastReport": 1674524603, "activation": 1671143627, "keepCRV": 0, "debtLimit": 0, "withdrawalQueuePosition": 0, "doHealthCheck": true, "inQueue": true, "emergencyExit": false, "isActive": true }, "risk": { "riskScore": 5, "riskGroup": "Others", "riskDetails": { "TVLImpact": 5, "auditScore": 5, "codeReviewScore": 5, "complexityScore": 5, "longevityImpact": 5, "protocolSafetyScore": 5, "teamKnowledgeScore": 5, "testingScore": 5 }, "allocation": { "status": "Green", "currentTVL": "0", "availableTVL": "0", "currentAmount": "0", "availableAmount": "0" } } } ], "migration": { "available": false, "address": "0x27B5739e22ad9033bcBf192059122d163b60349D", "contract": "0x0000000000000000000000000000000000000000" } }') : null;
	
	// let stethvaultData: TYearnVault = { address: vaultAddress, type: "Standard", symbol: "st-yCRV", display_symbol: "st-yCRV", formated_symbol: "yvst-yCRV", name: "Staked Yearn CRV Vault", display_name: "Staked Yearn CRV Vault", formated_name: "Staked Yearn CRV Vault yVault", icon: "https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0x27B5739e22ad9033bcBf192059122d163b60349D/logo-128.png", version: "0.4.3", category: "Curve", inception: 1664285315, decimals: 18, chainID: 1, riskScore: 0, endorsed: true, emergency_shutdown: false, token: { address: "0xfcc5c47be19d06bf83eb04298b026f81069ff65b", name: "Yearn CRV", symbol: "yCRV", type: "", display_name: "Yearn CRV", display_symbol: "yCRV", description: "yCRV is Yearn Finance's new and improved veCRV wrapper system designed to tokenize Yearn's veCRV position which passes all revenue and benefits along to users. This system is composed of a base-token called yCRV which a user can deposit into any one of three `activated` positons to earn yield or voting power: st-yCRV, lp-yCRV, and vl-yCRV. st-yCRV yVault receives admin fees and bribes from locked CRV. lp-yCRV yVault converts yCRV into CRV/yCRV LP tokens and uses them to farm CRV emissions and trading fees. vl-yCRV yVault is for voting power on Curve.fi gauge weights.", icon: "https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0xFCc5c47bE19d06BF83eB04298b026F81069ff65b/logo-128.png", decimals: 18 }, tvl: { total_assets: "24343110003314565819591808", total_delegated_assets: "0", tvl_deposited: 25755497.24570688, tvl_delegated: 0, tvl: 25755497.24570688, price: 1.05802 }, apy: { type: "v2:averaged", gross_apr: 0.4701175305298714, net_apy: 0.5240842324796011, fees: { performance: 0.1, withdrawal: 0, management: 0, keep_crv: 0, cvx_keep_crv: 0 }, points: { week_ago: 0.31081499718718986, month_ago: 0.5240842324796011, inception: 0.45349266414383815 }, composite: { boost: 0, pool_apy: 0, boosted_apr: 0, base_apr: 0, cvx_apr: 0, rewards_apr: 0 } }, details: { management: "0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7", governance: "0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52", guardian: "0x846e211e8ba920B353FB717631C015cf04061Cc9", rewards: "0x93A62dA5a14C80f265DAbC077fCEE437B1a0Efde", depositLimit: "100000000000000000000000000", availableDepositLimit: "75656889996685434180408192", comment: "st-yCRV", apyTypeOverride: "", apyOverride: 0, order: 110, performanceFee: 1000, managementFee: 0, depositsDisabled: false, withdrawalsDisabled: false, allowZapIn: false, allowZapOut: false, retired: false, hideAlways: false }, strategies: [ { address: "0xAf73A48E1d7e8300C91fFB74b8f5e721fBFC5873", name: "StrategyStYCRV", description: "Accepts {{token}} to earn a continuous share of [Curve Finance](https://curve.fi) fees and Curve DAO voting bribes. Earned [3Crv](https://curve.fi/3pool) (Curve's 3pool LP token) fees and rewards are harvested, swapped for more {{token}} which is deposited back into the strategy. Swap happens either via market-buy or mint, depending which is more capital efficient.", details: { keeper: "0x736D7e3c5a6CB2CE3B764300140ABF476F6CFCCF", strategist: "0x0B634A8D61b09820E9F72F79cdCBc8A4D0Aad26b", rewards: "0x0B634A8D61b09820E9F72F79cdCBc8A4D0Aad26b", healthCheck: "0x0000000000000000000000000000000000000000", totalDebt: "0", totalLoss: "0", totalGain: "934603273941638367854827", minDebtPerHarvest: "0", maxDebtPerHarvest: "115792089237316195423570985008687907853269984665640564039457584007913129639935", estimatedTotalAssets: "30000000000000000000000", creditAvailable: "0", debtOutstanding: "0", expectedReturn: "56773198154063704678774", delegatedAssets: "0", delegatedValue: "0", version: "0.4.3", protocols: [ "Curve Finance" ], apr: 0, performanceFee: 0, lastReport: 1674524603, activation: 1671143627, keepCRV: 0, debtLimit: 0, withdrawalQueuePosition: 0, doHealthCheck: true, inQueue: true, emergencyExit: false, isActive: true }, risk: { riskScore: 5, riskGroup: "Others", riskDetails: { TVLImpact: 5, auditScore: 5, codeReviewScore: 5, complexityScore: 5, longevityImpact: 5, protocolSafetyScore: 5, teamKnowledgeScore: 5, testingScore: 5 }, allocation: { status: "Green", currentTVL: "0", availableTVL: "0", currentAmount: "0", availableAmount: "0" } } } ], migration: { available: false, address: "0x27B5739e22ad9033bcBf192059122d163b60349D", contract: "0x0000000000000000000000000000000000000000" } };
	let sortedVaultsToDisplay1: TYearnVault[] = [vaultData];
	
	

	/* 🔵 - Yearn Finance **************************************************************************
	**	Callback method used to sort the vaults list.
	**	The use of useCallback() is to prevent the method from being re-created on every render.
	**********************************************************************************************/
	const	onSort = useCallback((newSortBy: string, newSortDirection: string): void => {
		performBatchedUpdates((): void => {
			set_sortBy(newSortBy as TPossibleSortBy);
			set_sortDirection(newSortDirection as TPossibleSortDirection);
		});
	}, []);

	/* 🔵 - Yearn Finance **************************************************************************
	**	The VaultList component is memoized to prevent it from being re-created on every render.
	**	It contains either the list of vaults, is some are available, or a message to the user.
	**********************************************************************************************/
	const	VaultList = useMemo((): ReactNode => {
		// if (isLoadingVaultsMigrations && category === 'Holdings') {
		// 	return (
		// 		<VaultsListEmpty
		// 			isLoading={isLoadingVaultsMigrations}
		// 			sortedVaultsToDisplay={sortedVaultsToDisplay}
		// 			currentCategory={category} />
		// 	);
		// }
		// if (isLoadingVaultList || sortedVaultsToDisplay.length === 0) {
		// 	return (
		// 		<VaultsListEmpty
		// 			isLoading={isLoadingVaultList}
		// 			sortedVaultsToDisplay={sortedVaultsToDisplay}
		// 			currentCategory={category} />
		// 	);
		// }
		return (
			sortedVaultsToDisplay1.map((vault): ReactNode => {
				if (!vault) {
					return (null);
				}
				return <VaultsListRow key={vault.address} currentVault={vault} />;
			})
		);
	}, [isLoadingVaultsMigrations, category, isLoadingVaultList, sortedVaultsToDisplay]);

	return (
		<section className={'mt-4 grid w-full grid-cols-12 gap-y-10 pb-10 md:mt-20 md:gap-x-10 md:gap-y-20'}>

			<HeaderUserPosition />

			<div className={'relative col-span-12 flex w-full flex-col bg-neutral-100'}>
				<div className={'absolute top-8 right-8'}>
					<VaultListOptions />
				</div>
				<ListHero
					headLabel={category}
					searchLabel={`Search ${category}`}
					searchPlaceholder={'YFI Vault'}
					categories={[
						[
							{value: 'Featured Vaults', label: 'Featured', isSelected: category === 'Featured Vaults'},
							{value: 'Crypto Vaults', label: 'Crypto', isSelected: category === 'Crypto Vaults'},
							{value: 'Stables Vaults', label: 'Stables', isSelected: category === 'Stables Vaults'},
							{value: 'Curve Vaults', label: 'Curve', isSelected: category === 'Curve Vaults'},
							{value: 'Balancer Vaults', label: 'Balancer', isSelected: category === 'Balancer Vaults'},
							{value: 'All Vaults', label: 'All', isSelected: category === 'All Vaults'}
						],
						[
							{
								value: 'Holdings',
								label: 'Holdings',
								isSelected: category === 'Holdings',
								node: (
									<Fragment>
										{'Holdings'}
										<span className={`absolute -top-1 -right-1 flex h-2 w-2 ${category === 'Holdings' || migratableVaults?.length === 0 ? 'opacity-0' : 'opacity-100'}`}>
											<span className={'absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-600 opacity-75'}></span>
											<span className={'relative inline-flex h-2 w-2 rounded-full bg-pink-500'}></span>
										</span>
									</Fragment>
								)
							}
						]
					]}
					onSelect={set_category}
					searchValue={searchValue}
					set_searchValue={set_searchValue} />

				{category === 'Holdings' && migratableVaults?.length > 0 ? (
					<div className={'my-4'}>
						{migratableVaults.map((vault): ReactNode => {
							if (!vault) {
								return (null);
							}
							return (
								<VaultsListInternalMigrationRow key={vault.address} currentVault={vault} />
							);
						})}
					</div>
				) : null}

				<ListHead
					sortBy={sortBy}
					sortDirection={sortDirection}
					onSort={onSort}
					items={[
						{label: 'Token', value: 'name', sortable: true},
						{label: 'APY', value: 'apy', sortable: true, className: 'col-span-2'},
						{label: 'Available', value: 'available', sortable: true, className: 'col-span-2'},
						{label: 'Deposited', value: 'deposited', sortable: true, className: 'col-span-2'},
						{label: 'TVL', value: 'tvl', sortable: true, className: 'col-span-2'}
					]} />

				{VaultList}
			</div>

		</section>
	);
}

Index.getLayout = function getLayout(page: ReactElement, router: NextRouter): ReactElement {
	return <Wrapper router={router}>{page}</Wrapper>;
};

export default Index;
