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
                        <div class="icon iconfont icon-Right text-lg text-#EAAE36 duration-100 transition transform ease-linear "
                            :class="`${item.showMore ? 'rotate-90' : 'rotate-0'}`" @click.stop="handleShowMore(index)">
                        </div>
                    </div>
                </div>
                <div class="flex justify-between items-center w-9/12 mb-6">
                    <div class="w-1/2 flex flex-col justify-start items-start">
                        <div class="text-white mb-2">{{ $t('wallet.votedAmount') }}</div>
                        <div class="text-#EAAE36 text-2xl font-light">{{ formatAmount(item.received) }} HAH</div>
                    </div>
                    <div class="w-1/2 flex flex-col justify-start items-start ml-8">
                        <div class="text-white mb-2 ">{{ $t('newWord.Waitingforcollection') }}</div>
                        <div class="text-#EAAE36 text-2xl font-light">{{ formatAmount(item.collection) }} HAH</div>
                    </div>
                </div>
                <div class="duration-100 transition-all transform ease-linear overflow-hidden flex flex-col justify-start items-center w-9/12"
                    :class="{
            'max-h-96 mb-5': item.showMore,
            'max-h-0': !item.showMore
        }">
                    <div
                        class="w-full flex justify-between items-center text-#A5A5A5 text-sm h-11 border-b border-dashed border-black">
                        <div class="">{{ $t('newWord.produced') }}</div>
                        <div class="">{{ formatAmount(parseFloat(item.collection) + parseFloat(item.received)) }} HAH
                        </div>
                    </div>
                    <div
                        class="w-full flex justify-between items-center text-#A5A5A5 text-sm h-11 border-b border-dashed border-black">
                        <div class="">存款時間</div>
                        <div class="">{{ timeFormat(item.startTime) }}</div>
                    </div>
                    <!-- <div
                        class="w-full flex justify-between items-center text-#A5A5A5 text-sm h-11 border-b border-dashed border-black">
                        <div class="">{{ $t('newWord.quantity') }}</div>
                        <div class="">{{ item.count }} HAH</div>
                    </div> -->
                    <div
                        class="w-full flex justify-between items-center text-#A5A5A5 text-sm h-11 border-b border-dashed border-black">
                        <div class="">鎖倉量</div>
                        <div class="">{{ item.count }} HAH</div>
                    </div>
                    <div
                        class="w-full flex justify-between items-center text-#A5A5A5 text-sm h-11 border-b border-dashed border-black">
                        <div class="">月化</div>
                        <div class="">15%</div>
                    </div>
                    <div
                        class="w-full flex justify-between items-center text-#A5A5A5 text-sm h-11 border-b border-dashed border-black">
                        <div class="">{{ $t('newWord.Countdowntounlockday') }}</div>
                        <div>{{ item.countdown || "00:00:00" }}</div>
                    </div>


                </div>
                <div class="w-full text-#303030 flex justify-center items-center bg-#EAAE36 py-2"
                    @click.stop="handleHarvest(item)">
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
        },
        lockPeriod: {
            type: String,
            required: true, // 必须传入锁仓期的秒数
        },
    },
    data() {
        return {
            countdown: "00:00:00", // 初始化倒计时显示
            timer: null,
            timers: {}, // 保存每个定时器的引用
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
    watch: {
        lockPeriod: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.startCountdown(newVal); // 初始化时调用倒计时
                }
            },
        },
    },
    mounted() {
        this.dataList.forEach((item, index) => {
            this.startCountdownForItem(item, index);
        });
    },
    beforeDestroy() {
        // 组件销毁前清除定时器，避免内存泄漏
        Object.values(this.timers).forEach(clearInterval); // 清除所有定时器
    },
    methods: {
        addressFilter, amountFormat, timeFormat,
        calculateCountdown(startTime, lockPeriod) {
            // 确保 startTime 和 lockPeriod 是数字
            const start = parseInt(startTime, 10); // 转为整数
            const lock = parseInt(lockPeriod, 10); // 转为整数

            const now = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
            const endTime = start + lock; // 计算结束时间戳

            if (now >= endTime) {
                return "00:00:00"; // 如果倒计时已结束
            }

            // 计算剩余时间
            const remainingTime = endTime - now;
            const hours = String(Math.floor(remainingTime / 3600)).padStart(2, "0");
            const minutes = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, "0");
            const seconds = String(remainingTime % 60).padStart(2, "0");

            return `${hours}:${minutes}:${seconds}`;
        },
        // 启动倒计时
        startCountdownForItem(item, index) {
            if (this.timers[index]) {
                clearInterval(this.timers[index]); // 清除已有定时器
            }

            this.timers[index] = setInterval(() => {
                const newCountdown = this.calculateCountdown(item.startTime, this.lockPeriod);
                // 仅更新 countdown 字段，保留其他字段
                this.$set(this.dataList[index], "countdown", newCountdown);
            }, 1000);
        },

        //格式化显示金额
        formatAmount(amount) {
            // 确保 `amount` 是字符串类型，以便进行操作
            const amountStr = amount.toString();

            // 检查是否包含小数点，处理小数部分
            const sanitizedAmount = amountStr.includes(".")
                ? amountStr.split(".")[0] // 去掉小数部分，仅保留整数
                : amountStr;

            // 将处理后的整数转换为 Ether
            let etherAmount = this.Web3.utils.fromWei(sanitizedAmount, "ether");

            // 保留 4 位小数，用于显示
            return parseFloat(etherAmount).toFixed(4);
        },
        //点击收割按钮
        handleHarvest(item) {
            this.$emit('handleHarvest', item)
        },
        startCountdown(seconds) {
            if (this.timer) {
                clearInterval(this.timer); // 清除已有的定时器，防止重复计时
            }

            let remainingTime = seconds;

            this.timer = setInterval(() => {
                if (remainingTime <= 0) {
                    clearInterval(this.timer);
                    this.countdown = "00:00:00"; // 倒计时结束后重置显示
                    return;
                }

                const hours = String(Math.floor(remainingTime / (60 * 60))).padStart(2, "0");
                const minutes = String(Math.floor((remainingTime % (60 * 60)) / 60)).padStart(2, "0");
                const secs = String(remainingTime % 60).padStart(2, "0");

                this.countdown = `${hours}:${minutes}:${secs}`;

                remainingTime--;
            }, 1000);
        },
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