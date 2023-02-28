import React, {useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import {VaultDetailsHeader} from '@vaults/components/details/VaultDetailsHeader';
import {VaultDetailsQuickActions} from '@vaults/components/details/VaultDetailsQuickActions';
import {VaultDetailsTabsWrapper} from '@vaults/components/details/VaultDetailsTabsWrapper';
import Wrapper from '@vaults/Wrapper';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {useChainID} from '@yearn-finance/web-lib/hooks/useChainID';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {ImageWithFallback} from '@common/components/ImageWithFallback';
import {useWallet} from '@common/contexts/useWallet';
import {useYearn} from '@common/contexts/useYearn';
import {variants} from '@common/utils/animations';

import type {NextPageContext} from 'next';
import type {NextRouter} from 'next/router';
import type {ReactElement} from 'react';
import type {TYearnVault} from '@common/types/yearn';

function CloneEl(): ReactElement {
	let vaultData = JSON.parse('{ "address": "0x73C68f1f41e4890D06Ba3e71b9E9DfA555f1fb46", "type": "Standard", "symbol": "Sharp-Eth", "display_symbol": "Sharp-Eth", "formated_symbol": "Sharp-Eth", "name": "ETH", "display_name": "ETH", "formated_name": "Staked Eth Vault", "icon": "https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0x27B5739e22ad9033bcBf192059122d163b60349D/logo-128.png", "version": "0.4.3", "category": "Curve", "inception": 1664285315, "decimals": 18, "chainID": 250, "riskScore": 0, "endorsed": true, "emergency_shutdown": false, "token": { "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", "name": "Ether", "symbol": "ETH", "type": "", "display_name": "Yearn CRV", "display_symbol": "yCRV", "description": "MagETH is built on top of ETH, the Ethereum Blockchains native token. MagETH is a vault that allows users to leverage their staked ETH position on Lido stETH through Aave Flashloans and p2p lending infrastructure Morpho, maximising user returns while ensuring healthy collateral and leverage.", "icon": "https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/multichain-tokens/1/0xFCc5c47bE19d06BF83eB04298b026F81069ff65b/logo-128.png", "decimals": 18 }, "tvl": { "total_assets": "24343110003314565819591808", "total_delegated_assets": "0", "tvl_deposited": 25755497.24570688, "tvl_delegated": 0, "tvl": 25755497.24570688, "price": 1.05802 }, "apy": { "type": "v2:averaged", "gross_apr": 0.4701175305298714, "net_apy": 0.11, "fees": { "performance": 0.1, "withdrawal": 0, "management": 0, "keep_crv": 0, "cvx_keep_crv": 0 }, "points": { "week_ago": 0.31081499718718986, "month_ago": 0.5240842324796011, "inception": 0.45349266414383815 }, "composite": { "boost": 0, "pool_apy": 0, "boosted_apr": 0, "base_apr": 0, "cvx_apr": 0, "rewards_apr": 0 } }, "details": { "management": "0x16388463d60FFE0661Cf7F1f31a7D658aC790ff7", "governance": "0xFEB4acf3df3cDEA7399794D0869ef76A6EfAff52", "guardian": "0x846e211e8ba920B353FB717631C015cf04061Cc9", "rewards": "0x93A62dA5a14C80f265DAbC077fCEE437B1a0Efde", "depositLimit": "100000000000000000000000000", "availableDepositLimit": "75656889996685434180408192", "comment": "st-yCRV", "apyTypeOverride": "", "apyOverride": 0, "order": 110, "performanceFee": 1000, "managementFee": 0, "depositsDisabled": false, "withdrawalsDisabled": false, "allowZapIn": false, "allowZapOut": false, "retired": false, "hideAlways": false }, "strategies": [ { "address": "0xAf73A48E1d7e8300C91fFB74b8f5e721fBFC5873", "name": "StrategyStYCRV", "description": "Accepts {{token}} to earn a continuous share of [Curve Finance](https://curve.fi) fees and Curve DAO voting bribes. Earned [3Crv](https://curve.fi/3pool) (Curves 3pool LP token) fees and rewards are harvested, swapped for more {{token}} which is deposited back into the strategy. Swap happens either via market-buy or mint, depending which is more capital efficient.", "details": { "keeper": "0x736D7e3c5a6CB2CE3B764300140ABF476F6CFCCF", "strategist": "0x0B634A8D61b09820E9F72F79cdCBc8A4D0Aad26b", "rewards": "0x0B634A8D61b09820E9F72F79cdCBc8A4D0Aad26b", "healthCheck": "0x0000000000000000000000000000000000000000", "totalDebt": "0", "totalLoss": "0", "totalGain": "934603273941638367854827", "minDebtPerHarvest": "0", "maxDebtPerHarvest": "115792089237316195423570985008687907853269984665640564039457584007913129639935", "estimatedTotalAssets": "30000000000000000000000", "creditAvailable": "0", "debtOutstanding": "0", "expectedReturn": "56773198154063704678774", "delegatedAssets": "0", "delegatedValue": "0", "version": "0.4.3", "protocols": [ "Curve Finance" ], "apr": 0, "performanceFee": 0, "lastReport": 1674524603, "activation": 1671143627, "keepCRV": 0, "debtLimit": 0, "withdrawalQueuePosition": 0, "doHealthCheck": true, "inQueue": true, "emergencyExit": false, "isActive": true }, "risk": { "riskScore": 5, "riskGroup": "Others", "riskDetails": { "TVLImpact": 5, "auditScore": 5, "codeReviewScore": 5, "complexityScore": 5, "longevityImpact": 5, "protocolSafetyScore": 5, "teamKnowledgeScore": 5, "testingScore": 5 }, "allocation": { "status": "Green", "currentTVL": "0", "availableTVL": "0", "currentAmount": "0", "availableAmount": "0" } } } ], "migration": { "available": false, "address": "0x27B5739e22ad9033bcBf192059122d163b60349D", "contract": "0x0000000000000000000000000000000000000000" } }')
	const {address, isActive} = useWeb3();
	const {safeChainID} = useChainID();
	const {vaults} = useYearn();
	const currentVault = useRef<TYearnVault>(vaultData);
	const {refresh} = useWallet();
	useEffect((): void => {
		if (address && isActive) {
			const	tokensToRefresh = [];
			if (currentVault?.current?.address) {
				tokensToRefresh.push({token: toAddress(currentVault.current.address)});
			}
			if (currentVault?.current?.token?.address) {
				tokensToRefresh.push({token: toAddress(currentVault.current.token.address)});
			}
			refresh(tokensToRefresh);
		}
	}, [currentVault.current?.address, currentVault.current?.token?.address, address, isActive, refresh]);

	return (
		<>
			<header className={'relative z-50 flex w-full items-center justify-center'}>
				<motion.div
					key={'vaults'}
					initial={'initial'}
					animate={'enter'}
					variants={variants}
					className={'z-50 -mt-6 h-12 w-12 cursor-pointer md:-mt-36 md:h-[72px] md:w-[72px]'}>
					{/* <ImageWithFallback
						src={`${process.env.BASE_YEARN_ASSETS_URI}/${safeChainID}/${toAddress(currentVault.current.token.address)}/logo-128.png`}
						alt={''}
						width={72}
						height={72} /> */}
				</motion.div>
			</header>

			<section className={'mt-4 grid w-full grid-cols-12 pb-10 md:mt-0'}>
				<VaultDetailsHeader currentVault={currentVault.current} />
				<VaultDetailsQuickActions currentVault={currentVault.current} />
				<VaultDetailsTabsWrapper currentVault={currentVault.current} />
			</section>
		</>
	);
}

CloneEl.getLayout = function getLayout(page: ReactElement, router: NextRouter): ReactElement {
	return <Wrapper router={router}>{page}</Wrapper>;
};

export default CloneEl;
