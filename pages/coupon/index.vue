<template>
  <view class="container">
    <view v-if="list.length" class="coupon-list">
      <view class="coupon-item" v-for="(item, index) in list" :key="index">
        <view class="item-wrapper"
          :class="[ item.state.value ? 'color-' + color[index % color.length] : 'color-gray' ]">
          <view class="coupon-type">{{ CouponTypeEnum[item.coupon_type].name }}</view>
          <view class="tip dis-flex flex-dir-column flex-x-center">
            <view v-if="item.coupon_type == CouponTypeEnum.FULL_DISCOUNT.value">
              <text class="f-30">￥</text>
              <text class="money">{{ item.reduce_price }}</text>
            </view>
            <text class="money" v-if="item.coupon_type == CouponTypeEnum.DISCOUNT.value">{{ item.discount }}折</text>
            <text class="pay-line">满{{ item.min_price }}元可用</text>
          </view>
          <view class="split-line"></view>
          <view class="content dis-flex flex-dir-column flex-x-between">
            <view class="title oneline-hide">{{ item.name }}</view>
            <view class="bottom dis-flex flex-y-center">
              <view class="time flex-box">
                <text v-if="item.expire_type == 10">领取{{ item.expire_day }}天内有效</text>
                <text v-if="item.expire_type == 20">
                  <block v-if="item.start_time === item.end_time">{{ item.start_time }} 当天有效</block>
                  <block v-else>{{ item.start_time }}~{{ item.end_time }}</block>
                </text>
              </view>
              <view v-if="$checkModule('market-coupon') && item.state.value" class="receive" @click="receive(item.coupon_id)">
                <text>立即领取</text>
              </view>
              <view v-else class="receive state">
                <text>{{ item.state.text }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <empty v-if="!list.length" :isLoading="isLoading" />
  </view>
</template>

<script>
  import * as CouponApi from '@/api/coupon'
  import * as MyCouponApi from '@/api/myCoupon'
  import { CouponTypeEnum } from '@/common/enum/coupon'
  import Empty from '@/components/empty'

  const color = ['red', 'blue', 'violet', 'yellow']

  export default {
    components: {
      Empty
    },
    data() {
      return {
        // 枚举类
        CouponTypeEnum,
        // 颜色组
        color,
        // 优惠券列表
        list: [],
        // 正在加载中
        isLoading: true
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      // 获取优惠券列表
      this.getCouponList()
    },

    methods: {

      /**
       * 获取优惠券列表
       * @param {bool} load 是否显示loading弹窗
       */
      getCouponList(load = true) {
        const app = this
        app.isLoading = true
        CouponApi.list({}, { load })
          .then(result => {
            app.list = result.data.list
          })
          .finally(() => app.isLoading = false)
      },

      // 立即领取
      receive(couponId) {
        const app = this
        MyCouponApi.receive(couponId)
          .then(result => {
            // 显示领取成功提示
            app.$success(result.message)
            // 刷新优惠券列表
            app.getCouponList(false)
          })
      }

    }
  }
</script>

<style lang="scss" scoped>
  .coupon-list {
    padding: 20rpx;
  }


  .coupon-item {
    position: relative;
    overflow: hidden;
    margin-bottom: 22rpx;
  }

  .item-wrapper {
    width: 100%;
    display: flex;
    background: #fff;
    border-radius: 8rpx;
    color: #fff;
    height: 180rpx;

    .coupon-type {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 10;
      width: 128rpx;
      padding: 3px 0;
      background: #a771ff;
      font-size: 20rpx;
      text-align: center;
      color: #ffffff;
      transform: rotate(45deg);
      transform-origin: 64rpx 64rpx;
    }

    &.color-blue {
      background: linear-gradient(-125deg, #57bdbf, #2f9de2);
    }

    &.color-red {
      background: linear-gradient(-128deg, #ff6d6d, #ff3636);
    }

    &.color-violet {
      background: linear-gradient(-113deg, #ef86ff, #b66ff5);

      .coupon-type {
        background: #55b5ff;
      }
    }

    &.color-yellow {
      background: linear-gradient(-141deg, #f7d059, #fdb054);
    }

    &.color-gray {
      background: linear-gradient(-113deg, #bdbdbd, #a2a1a2);

      .coupon-type {
        background: #9e9e9e;
      }
    }

    .content {
      flex: 1;
      padding: 30rpx 20rpx;
      border-radius: 8px 0 0 8px;

      .title {
        width: 400rpx;
        font-size: 32rpx;
      }

      .bottom {
        .time {
          font-size: 24rpx;
        }

        .receive {
          height: 46rpx;
          width: 122rpx;
          border: 1px solid #fff;
          border-radius: 30rpx;
          color: #fff;
          font-size: 24rpx;
          display: flex;
          justify-content: center;
          align-items: center;

          &.state {
            border: none;
          }
        }
      }
    }

    .tip {
      position: relative;
      flex: 0 0 32%;
      text-align: center;
      border-radius: 0 8px 8px 0;

      .money {
        font-weight: bold;
        font-size: 52rpx;
      }

      .pay-line {
        font-size: 22rpx;
      }
    }

    .split-line {
      position: relative;
      flex: 0 0 0;
      border-left: 4rpx solid #fff;
      margin: 0 5px 0 3px;
      background: #fff;

      &:before,
        {
        border-radius: 0 0 16rpx 16rpx;
        top: 0;
      }

      &:after {
        border-radius: 16rpx 16rpx 0 0;
        bottom: 0;
      }

      &:before,
      &:after {
        content: '';
        position: absolute;
        width: 24rpx;
        height: 12rpx;
        background: #f7f7f7;
        left: -14rpx;
        z-index: 1;
      }


    }
  }
</style>
