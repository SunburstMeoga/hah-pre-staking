<template>
    <div class="pb-12 bg-#1F1F1F">
        <div v-for="(item, index) in dataList" :key="index" class="relative">

            <div @click="handleAddress(item)"
                class="w-full bg-#282828 rounded-xl overflow-hidden flex flex-col justify-start items-center pt-4 mb-4 card-shadow ">

                <div class="flex justify-between items-center mb-6 w-9/12">
                    <!-- <div class="text-2xl font-light text-#A5A5A5">{{ item.name }}</div> -->
                    <div class="text-2xl font-light text-white">{{
            addressFilter($store.state.walletInfo.address)
            || '-' }}</div>
                    <div class="flex justify-end items-center -mr-6">
                        <div class="icon iconfont icon-Right text-lg text-#EAAE36 duration-150 transition transform ease-linear "
                            :class="`${item.showMore ? 'rotate-90' : 'rotate-0'}`" @click.stop="handleShowMore(index)">
                        </div>
                    </div>
                </div>
                <div class="flex justify-between items-center w-9/12 mb-6">
                    <div class="w-1/2 flex flex-col justify-start items-start">
                        <div class="text-white mb-2">{{ $t('wallet.votedAmount') }}</div>
                        <div class="text-#EAAE36 text-2xl font-light">{{ item.received }} HAH</div>
                    </div>
                    <div class="w-1/2 flex flex-col justify-start items-start ml-8">
                        <div class="text-white mb-2 ">{{ $t('newWord.Waitingforcollection') }}</div>
                        <div class="text-#EAAE36 text-2xl font-light">{{ item.collection }} HAH</div>
                    </div>
                </div>
                <div class="duration-150 transition-all transform ease-linear overflow-hidden flex flex-col justify-start items-center w-9/12"
                    :class="{
            'max-h-96 mb-5': item.showMore,
            'max-h-0': !item.showMore
        }">
                    <div
                        class="w-full flex justify-between items-center text-#A5A5A5 text-sm h-11 border-b border-dashed border-black">
                        <div class="">{{ $t('newWord.produced') }}</div>
                        <div class="">{{ item.produced }} HAH</div>
                    </div>
                    <div
                        class="w-full flex justify-between items-center text-#A5A5A5 text-sm h-11 border-b border-dashed border-black">
                        <div class="">{{ $t('newWord.quantity') }}</div>
                        <div class="">{{ item.count }} HAH</div>
                    </div>
                    <div
                        class="w-full flex justify-between items-center text-#A5A5A5 text-sm h-11 border-b border-dashed border-black">
                        <div class="">{{ $t('newWord.Countdowntounlockday') }}</div>
                        <div class="">{{ item.countDown }}</div>
                    </div>

                </div>
                <div class="w-full text-#303030 flex justify-center items-center bg-#EAAE36 py-2">
                    {{ $t('newWord.Harvest') }}</div>
            </div>
        </div>
    </div>

</template>

<script>
import { addressFilter, amountFormat, timeFormat } from '@/utils/format';
import { Toast } from 'vant'

export default {
    props: {
        dataList: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        tableTitleList() {
            return [this.$t('table.name'), this.$t('table.address'), this.$t('table.votes'), this.$t('table.nodeRank'), this.$t('table.point'), this.$t('details.time'),]
        },
        //节点收益
        nodeReward() {
            return this.dataList.reduce((total, item) => {
                // 如果 details 不为空，累加 voteAmount
                if ((item.details && item.details.length > 0) && (item.details && item.details.length > 0).length > 0) {
                    const detailsSum = (item.details && item.details.length > 0).reduce((sum, detail) => {
                        return sum + parseFloat(detail.revoterewardamount || 0);
                    }, 0);
                    return total + detailsSum;
                }
                // 如果 details 为空，直接返回当前总和
                return total;
            }, 0).toFixed(2);
        },
        //节点票数
        delegateVotes() {
            return this.dataList.reduce((total, item) => {
                // 如果 details 不为空，累加 voteAmount
                if ((item.details && item.details.length > 0) && (item.details && item.details.length > 0).length > 0) {
                    const detailsSum = (item.details && item.details.length > 0).reduce((sum, detail) => {
                        return sum + parseFloat(detail.stopedrewardamount || 0);
                    }, 0);
                    return total + detailsSum;
                }
                // 如果 details 为空，直接返回当前总和
                return total;
            }, 0).toFixed(2);
        },
        //用户对该节点已投票数
        votedCount() {
            return this.dataList.reduce((total, item) => {
                // 如果 details 不为空，累加 voteAmount
                if ((item.details && item.details.length > 0) && (item.details && item.details.length > 0).length > 0) {
                    const detailsSum = (item.details && item.details.length > 0).reduce((sum, detail) => {
                        return sum + parseFloat(detail.voteamount || 0);
                    }, 0);
                    return total + detailsSum;
                }
                // 如果 details 为空，直接返回当前总和
                return total;
            }, 0).toFixed(2); // 保留两位小数
        }
    },
    methods: {
        addressFilter, amountFormat, timeFormat,
        handleShowMore(index) {
            const item = this.dataList[index];
            const newItem = {};
            for (const key in item) {
                if (item.hasOwnProperty(key)) {
                    newItem[key] = item[key];
                }
            }
            newItem.showMore = !item.showMore;
            this.$set(this.dataList, index, newItem);
        },

        handleAddress(item) {
            console.log(item)
            // this.toDetails(item.address, item.rank, item.name)
        },
        toDetails(address, rank, name) {
            console.log(address, rank, name)
            if (!localStorage.getItem('connectStatus') || localStorage.getItem('connectStatus') === 'disconnect') {
                Toast(this.$t('toast.linkWallet'))
                return
            }
            this.$router.push({
                path: '/node/' + address,
                query: {
                    rank: rank,
                    name: name
                }
            })
        },
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
.node-item {
    @apply flex justify-between items-center text-sm
}
</style>