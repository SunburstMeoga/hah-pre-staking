<template>
    <div class="bg-#1F1F1F">
        <div class="mb-8 w-full bg-#282828" v-if="$store.state.walletInfo.address"
            style="box-shadow:0 0.5rem 1.2rem rgba(82, 85, 92, .15);">
            <wallet-info :totalIncome="totalIncome" :totalVotes="totalVotes" :counts="counts" />
        </div>
        <div class="w-11/12 mx-auto flex justify-center items-center pb-4 ">
            <module-title :title="$t('home.nodeList')" :count="$t('home.totalNode', { count: delegateCount })" />
        </div>
        <div class="w-11/12 mx-auto c ">
            <div class="text-red-500" v-if="nodeListLoadStatus === 'error'">
                {{ errText }}
            </div>
            <h-loading :loadStatus="nodeListLoadStatus" @reload="getUserDeposit" />
            <div v-if="nodeListLoadStatus === 'finished'">
                <vote-node-card :dataList="nodeDataList" :lockPeriod="lockPeriod" @handleHarvest="handleHarvest" />
            </div>
        </div>

    </div>
</template>

<script>
import ModuleTitle from '@/components/ModuleTitle'
import WalletInfo from '@/components/WalletInfo'
import VoteNodeCard from '@/components/VoteNodeCard'
import VotedNodeCard from '@/components/VotedNodeCard'

import HLoading from '@/components/HLoading'

import { nodeList, nodeDetails, delegateList, delegateDetails } from '@/request/api'
import { amountFormat } from '@/utils/format'
import { Toast } from 'vant'
export default {
    components: { WalletInfo, ModuleTitle, VoteNodeCard, VotedNodeCard, HLoading },
    data() {
        return {
            nodeDataList: [],
            votedDataList: [],
            voteTotal: '',
            delegateCount: 0,
            rewardMode: '-',
            ordinary: '-',
            nodeListLoadStatus: 'loading',

            counts: {},
            lockPeriod: '',
            errText: ''
        }
    },
    activated() {
        this.fetchNodeDataList(); // 每次激活时重新加载数据
    },
    mounted() {
        // console.log('init ........')
        // console.log('登录状态', localStorage.getItem('connectStatus'))
        // this.getNodeList()
        // this.getDelegateList()
        setTimeout(() => {
            this.getUserDeposit()
        }, 3000);
    },
    computed: {
        //总投票量
        totalVotes() {
            return this.nodeDataList.reduce((total, item) => {
                // 如果 details 不为空，累加 voteAmount
                if (item.details && item.details.length > 0) {
                    const detailsSum = item.details.reduce((sum, detail) => {
                        return sum + parseFloat(detail.voteamount || 0);
                    }, 0);
                    return total + detailsSum;
                }
                // 如果 details 为空，直接返回当前总和
                return total;
            }, 0).toFixed(2);
        },
        //总收益
        totalIncome() {
            return this.nodeDataList.reduce((total, item) => {
                // 如果 details 不为空，累加 voteAmount
                if (item.details && item.details.length > 0) {
                    const detailsSum = item.details.reduce((sum, detail) => {
                        return sum + parseFloat(detail.totalrewardamount || 0);
                    }, 0);
                    return total + detailsSum;
                }
                // 如果 details 为空，直接返回当前总和
                return total;
            }, 0).toFixed(2);
        },
    },
    methods: {
        amountFormat,
        //点击收穫按钮
        async handleHarvest(item) {
            console.log(item)

            Toast.loading({
                forbidClick: true,
                duration: 0
            });
            let web3Contract = new this.Web3.eth.Contract(this.Config.pre_staking_abi, this.Config.pre_staking_addr)
            let calculateInterestRes = await web3Contract.methods.calculateInterest(this.$store.state.walletInfo.address).call();
            console.log('calculateInterestRes', calculateInterestRes)
            if (item.lockPeriod > 0) {
                if (calculateInterestRes === 0 || calculateInterestRes === '0') {
                    Toast.fail('暂无可领取的利息');
                } else {
                    //提取利息
                    web3Contract.methods.withdrawInterest().send({
                        from: this.$store.state.walletInfo.address,
                    }).then(res => {
                        this.getUserDeposit()
                        Toast.fail('收穫成功');
                        console.log('res', res)
                    }).catch(err => {
                        Toast.fail('收穫失敗，請重試');
                        console.log('err', err)
                    })
                }
                return
            }

            web3Contract.methods.withdrawPrincipal().send({ //領取利息+本金
                from: this.$store.state.walletInfo.address,
            }).then(res => {
                this.getUserDeposit()
                Toast.fail('收穫成功');
                console.log('res', res)
            }).catch(err => {
                Toast.fail('收穫失敗，請重試');
                console.log('err', err)
            })
        },
        //查询用户的存款信息
        async getUserDeposit() {

            let web3Contract = new this.Web3.eth.Contract(this.Config.pre_staking_abi, this.Config.pre_staking_addr)

            try {
                this.nodeListLoadStatus = 'loading'
                // showMore: false,
                //     countDown: '2025-01-27', 倒计时
                //     count: '564', 数量
                //     produced: '345', 已产出
                //     collection: '876', 待领取
                //     received: '45' , 已收获
                //     lockPeriod: ''，锁仓期
                let obj = {}
                console.log(this.$store.state.walletInfo.address)
                let depositsRes = await web3Contract.methods.deposits(this.$store.state.walletInfo.address).call();
                let calculateInterestRes = await web3Contract.methods.calculateInterest(this.$store.state.walletInfo.address).call();
                let lockPeriodRes = await web3Contract.methods.LOCK_PERIOD().call();
                obj['startTime'] = depositsRes.startTime //存款开始时间戳
                obj['count'] = depositsRes.amount //存款数量 
                obj['produced'] = '0.00'
                obj['collection'] = calculateInterestRes //⽤户可提取的利息
                obj['received'] = depositsRes.withdrawnInterest //已领取的利息数量
                obj['showMore'] = false
                obj['lockPeriod'] = lockPeriodRes //锁仓期（秒）
                this.lockPeriod = lockPeriodRes
                this.nodeDataList[0] = obj
                this.nodeListLoadStatus = 'finished'
                console.log(depositsRes, calculateInterestRes, lockPeriodRes)
            } catch (err) {
                console.log(err)
                this.errText = err
                this.nodeListLoadStatus = 'error'
            }

        },
        //收穫
        async userHarvest() {

        },
        //投票节点列表数据
        async getDelegateList() {
            this.nodeListLoadStatus = 'loading'
            try {
                this.nodeDataList = [{
                    showMore: false,
                    countDown: '2025-01-27',
                    count: '564',
                    produced: '345',
                    collection: '876',
                    received: '45'
                }, {
                    showMore: false,
                    countDown: '2025-04-01',
                    count: '75',
                    produced: '645',
                    collection: '3',
                    received: '23'
                }, {
                    showMore: false,
                    countDown: '2025-03-23',
                    count: '7',
                    produced: '24',
                    collection: '43',
                    received: '23'
                }, {
                    showMore: false,
                    countDown: '2025-01-01',
                    count: '423',
                    produced: '9',
                    collection: '56',
                    received: '23'
                }, {
                    showMore: false,
                    countDown: '2025-03-09',
                    count: '4234',
                    produced: '2323',
                    collection: '2323',
                    received: '23'
                },]

                this.nodeListLoadStatus = 'finished'
            } catch (err) {
                this.nodeListLoadStatus = 'error'
                console.log(err)
                Toast.clear()
            }
        },

        //获取節點列表数据
        getNodeList() {
            // this.nodeListLoadStatus = 'loading'
            // nodeList({ pageSize: 50, address: window.ethereum.selectedAddress }).then(async (res) => {
            //     console.log('節點列表----', res)
            //     res.data.map((item, index) => {
            //         item.rank = index + 1
            //     })
            //     if (res.data.length === 0) {
            //         this.nodeListLoadStatus = 'empty'
            //         return
            //     }
            //     this.nodeDataList = res.data
            //     await Promise.all(this.nodeDataList.map(async (item, index) => {
            //         item.showMore = false
            //         console.log(item)
            //         //当期那用户在该节点的投票信息
            //         let details = await nodeDetails({ dposAddress: item.address, address: window.ethereum.selectedAddress })
            //         item.votesList = details.vote
            //         item.dpos = details.dpos
            //         console.log(details)
            //         console.log(item)
            //     }))
            //     this.nodeDataList[0].name = 'HashGuardian'
            //     this.nodeDataList[1].name = 'BlockSentinel'
            //     this.nodeDataList[2].name = 'ChainPioneer'
            //     this.nodeDataList[3].name = 'NodeTitan'
            //     this.nodeDataList[4].name = 'CryptoHaven'
            //     this.nodeDataList[5].name = 'AnchorCore'
            //     this.totalVotes = this.nodeDataList.reduce((sum, item) => sum + parseInt(item.votes, 10), 0);
            //     this.totalIncome = this.nodeDataList.reduce((sum, item) => sum + parseInt(item.reward, 10), 0);
            //     console.log('votes', this.totalVotes)
            //     console.log('incone', this.totalIncome)

            //     this.delegateCount = res.total
            //     let earningsInfo = {
            //         ordinaryEarnings: res.income1 ? this.amountFormat(res.income1) : null,
            //         indexReturns: res.income0 ? this.amountFormat(res.income0) : null,
            //         totalEarnings: res.income0 || res.income1 ? (res.income0 + res.income1).toFixed(4) : null,
            //         ordinaryVote: res.vote1 ? this.amountFormat(res.vote1) : null,
            //         returnsVote: res.vote0 ? this.amountFormat(res.vote0) : null,
            //         totalVotes: res.vote0 || res.vote1 ? this.amountFormat(res.vote0 + res.vote1) : null,
            //         amount: res.amount ? this.amountFormat(res.amount) : null,
            //         income: res.income ? this.amountFormat(res.income) : null,
            //     }
            //     res.data.map((item, index) => {
            //         if (item.amount !== '0') {
            //             this.votedDataList.push(item)
            //         }
            //     })
            //     localStorage.setItem('earningsInfo', JSON.stringify(earningsInfo))
            //     this.$store.commit('getEarningsInfo', JSON.parse(localStorage.getItem('earningsInfo')))
            //     console.log('vuex的值', this.$store.state.earningsInfo)
            //     console.log('節點列表', this.nodeDataList)
            //     let counts = { 0: 0, 1: 0, 2: 0 };
            //     this.nodeDataList.forEach(item => { //统计 进行中，已贖回，停止復投中的数据
            //         item.votesList.forEach(vote => {
            //             if (counts.hasOwnProperty(vote.status)) {
            //                 counts[vote.status]++;
            //             }
            //         });
            //     });
            //     this.counts = counts
            //     console.log(counts)

            //     this.nodeListLoadStatus = 'finished'
            // }).catch(err => {
            //     this.nodeListLoadStatus = 'error'

            //     console.log(err)
            //     Toast.clear()
            // })
        },
    }
}
</script>

<style></style>