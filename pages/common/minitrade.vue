<template>
	<view></view>
</template>

<script>
import { urlEncode } from '../../utils/util';
	export default {
		data() {
			return {
				
			}
		},
		
		onLoad(item){
			console.log(item);
			let urlParams = Object.keys(item).map(key => key + '=' + encodeURIComponent(item[key]).replace(/%20/g,"+")).join('&');

			my.tradePay({
			  orderStr: urlParams,
			  success: (res) => {
				  
				my.alert({
				  content: JSON.stringify(res),
				});
				console.log(res);
				my.exitMiniProgram();
			  },
			  fail: (res) => {
				my.alert({
				  content: JSON.stringify(res),
				});
			  }
			});			
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
