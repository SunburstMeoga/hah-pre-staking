<template>
    <div>
        <div class="w-full flex flex-col justify-start items-center card-shadow ">
            <div class="w-11/12 flex flex-col justify-start items-start">
                <div class="w-full flex justify-start items-center mb-4">
                    <div class="w-1/3 h-1 bg-#EAAE36 rounded-full"></div>
                </div>
                <div class="w-full flex justify-between items-center text-base mb-2">
                    <div class="text-#A5A5A5">{{ $t('wallet.address') }}：{{
                        addressFilter($store.state.walletInfo.address)
                        || '-' }}</div>
                    <div class="icon iconfont icon-fuzhi text-white text-lg"
                        @click="copyContent($store.state.walletInfo.address)"></div>
                </div>
                <!-- <div class="w-full border-b border-dashed border-black flex justify-between items-center pb-2 mb-4">
                    <div class="flex flex-col justify-start items-start pl-2 w-1/2">
                        <div class="text-#FFFFFF73 mb-1 text-sm">{{$t('wallet.totalRevenue')}}</div>
                        <div class="text-#EAAE36 text-3xl font-bold">{{ Number(totalIncome).toFixed(2) }}</div>
                    </div>
                    <div class="border-l border-#00000061 h-10 w-1"></div>
                    <div class="flex flex-col justify-start items-start w-1/2 pl-6">
                        <div class="text-#FFFFFF73 mb-1 text-sm">{{$t('newWord.total')}}</div>
                        <div class="flex justify-start items-baseline">
                            <div class="text-#EAAE36 text-3xl font-bold">{{ Number(totalVotes).toFixed(2) }}</div>
                            <div class="text-#846934 ml-1 text-sm" v-show="Math.floor(totalVotes) === 0">{{$t('wallet.notVotes')}}</div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-evenly items-center pb-4 w-full">
                    <div class="flex flex-col justify-start items-center w-1/3">
                        <div class="flex justify-start items-center mb-3">
                            <div class="w-2 h-2 rounded-full bg-#00FFEA"></div>
                            <div class="text-xs ml-2 text-#FFFFFF73">{{$t('newWord.reInvesting')}}</div>
                        </div>
                        <div class="text-#EAAE36 text-2xl">{{ counts['1'] }}</div>
                    </div>

                    <div class="flex flex-col justify-start items-center w-1/3">
                        <div class="flex justify-start items-center mb-3">
                            <div class="w-2 h-2 rounded-full bg-#FFD667"></div>
                            <div class="text-xs ml-2 text-#FFFFFF73">{{$t('newWord.stopInves')}}</div>
                        </div>
                        <div class="text-#EAAE36 text-2xl">{{ counts['2'] }}</div>
                    </div>
                    <div class="flex flex-col justify-start items-center w-1/3">
                        <div class="flex justify-start items-center mb-3">
                            <div class="w-2 h-2 rounded-full bg-#A5A5A5"></div>
                            <div class="text-xs ml-2 text-#FFFFFF73">{{$t('newWord.redeemed')}}</div>
                        </div>
                        <div class="text-#EAAE36 text-2xl">{{ counts['0'] }}</div>
                    </div>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script>
import { addressFilter, amountFormat } from '@/utils/format'
import { Toast } from 'vant'

export default {
    data() {
        return {

        }
    },
    props: {
        totalIncome: {
            type: String,
            default: '0'
        },
        totalVotes: {
            type: String,
            default: '0'
        },
        counts: {
            type: Object,
            default: () => { }
        }
    },
    computed: {
        walletInfoList() {
            return [
                { title: this.$t('wallet.address'), copy: this.$store.state.walletInfo.address, content: this.$store.state.walletInfo.address || '-' },
                { title: this.$t('wallet.balance'), content: this.amountFormat(this.$store.state.walletInfo.balance) + ' HAH' || '00000000' },
                // { title: this.$t('wallet.ordinaryVote'), content: this.earningsInfo.ordinaryVote ? this.earningsInfo.ordinaryVote + ' HAH' : this.$t('wallet.notVotes') },
                // { title: this.$t('wallet.returnsVote'), content: this.earningsInfo.returnsVote ? this.earningsInfo.returnsVote + ' HAH' : this.$t('wallet.notVotes') },
                { title: this.$t('wallet.totalVotes'), content: this.earningsInfo.totalVotes ? this.earningsInfo.totalVotes + ' HAH' : this.$t('wallet.notVotes') },
                { title: this.$t('table.votes'), content: this.earningsInfo.amount ? this.earningsInfo.amount + ' HAH' : this.$t('wallet.notVotes') },
                { title: this.$t('wallet.earnings'), content: this.earningsInfo.income ? this.earningsInfo.income + ' HAH' : this.$t('wallet.notEarning') },

            ]
        },
        earningsInfo() {
            return this.$store.state.earningsInfo
        }
    },
    methods: {
        addressFilter, amountFormat,
        copyContent(content) {
            if (!content) return;

            // 检查 Clipboard API 是否支持
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                Toast(this.$t('toast.copyNotSupported')); // 显示不支持提示
                return;
            }

            // 调用 Clipboard API
            navigator.clipboard.writeText(content).then(() => {
                Toast(this.$t('toast.copySuccess'));
            }).catch(() => {
                Toast(this.$t('toast.copyFail')); // 处理复制失败
            });
        }
    }
}
</script>
<style>
.earning {}
</style>