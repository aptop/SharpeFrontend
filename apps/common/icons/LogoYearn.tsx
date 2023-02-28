import React from 'react';

import type {ReactElement} from 'react';
import Image from 'next/image';
import {MotionDiv} from './MotionDiv';
import type {ImageProps} from 'next/image';
const MagethLogo = require('../../../public/MagethImage.png')

function	LogoYearn(props: React.SVGProps<SVGSVGElement> & {back?: string, front?: string}): ReactElement {
	return (
		// <svg
		// 	{...props}
		// 	width={'32'}
		// 	height={'32'}
		// 	viewBox={'0 0 32 32'}
		// 	fill={'none'}
		// 	xmlns={'http://www.w3.org/2000/svg'}>
		// 	<circle
		// 		cx={'16'}
		// 		cy={'16'}
		// 		r={'16'}
		// 		fill={'currentColor'}
		// 		className={props?.back || 'text-neutral-900'}/>
		// 	<path
		// 		fillRule={'evenodd'}
		// 		clipRule={'evenodd'}
		// 		d={'M9.3268 6.28268L8.06787 7.56538L11.1398 10.6947L14.2117 13.8241V16.737V19.65H16.0018H17.7919V16.737V13.8241L20.8563 10.7023L23.9208 7.58056L22.654 6.29121L21.3873 5.00185L18.7111 7.72075C17.2392 9.21616 16.0203 10.4396 16.0025 10.4396C15.9846 10.4396 14.764 9.21573 13.2901 7.71982C11.8161 6.22392 10.6046 5 10.5979 5C10.5912 5 10.0192 5.57722 9.3268 6.28268ZM7.90755 13.8008C7.5069 14.6625 7.27486 15.4051 7.12543 16.3036C6.6982 18.8726 7.37349 21.5183 8.98149 23.5752C9.24682 23.9146 10.0275 24.7095 10.3584 24.9773C11.8479 26.1823 13.5436 26.85 15.4457 26.9802C16.5835 27.0581 17.7212 26.9061 18.8387 26.527C22.0686 25.4312 24.4006 22.6027 24.905 19.1692C25.099 17.848 24.9943 16.4347 24.6057 15.1313C24.4512 14.613 24.1382 13.8366 23.9746 13.5658L23.912 13.4623L22.55 14.8485C21.4514 15.9666 21.1913 16.2467 21.2053 16.2965C21.3176 16.6973 21.3772 17.114 21.3932 17.6101C21.4242 18.5714 21.2749 19.3484 20.9033 20.1599C20.181 21.7375 18.7717 22.8635 17.0486 23.2396C16.7494 23.3049 16.6394 23.3123 15.9866 23.3114C15.346 23.3104 15.2202 23.3019 14.9399 23.2402C13.2315 22.8641 11.8879 21.7996 11.1299 20.2217C10.7873 19.5086 10.6322 18.8486 10.6088 18.0043C10.5919 17.3937 10.625 17.0245 10.7396 16.5439L10.8134 16.2348L9.45584 14.8517C8.70918 14.0909 8.09011 13.4685 8.08016 13.4685C8.07018 13.4685 7.9925 13.618 7.90755 13.8008Z'}
		// 		fill={'currentColor'}
		// 		className={props?.front || 'text-neutral-900'} />
		// </svg>
		// <img src="../../../public/MagethImage.png" alt="alternative text" width="32" height="32"/>
		<Image
					alt={"alt"}
					src={MagethLogo}
					loading={'eager'}
					style={{width: "128px"}}
		/>
		// public\MagethImage.png
		// E:\Sharpe_AI\FrontEnd\StEthFrontend\yearn.fi\public\MagethImage.png
	);
}

export default LogoYearn;

