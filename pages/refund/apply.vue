<template>
  <view v-if="!isLoading" class="container" :style="appThemeStyle">

    <!-- 商品详情 -->
    <view class="goods-detail b-f dis-flex flex-dir-row">
      <view class="left">
        <image class="goods-image" :src="goods.goods_image"></image>
      </view>
      <view class="right dis-flex flex-box flex-dir-column flex-x-around">
        <view class="goods-name">
          <text class="twoline-hide">{{ goods.goods_name }}</text>
        </view>
        <view class="dis-flex col-9 f-24">
          <view class="flex-box">
            <view class="goods-props clearfix">
              <view class="goods-props-item" v-for="(props, idx) in goods.goods_props" :key="idx">
                <text>{{ props.value.name }}</text>
              </view>
            </view>
          </view>
          <text class="t-r">×{{ goods.total_num }}</text>
        </view>
      </view>
    </view>

    <!-- 服务类型 -->
    <view class="row-service b-f m-top20">
      <view class="row-title">服务类型</view>
      <view class="service-switch dis-flex">
        <view class="switch-item" v-for="(item, index) in RefundTypeEnum.data" :key="index" :class="{ active: formData.type == item.value }"
          @click="onSwitchService(item.value)">{{ item.name }}</view>
      </view>
    </view>

    <!-- 申请原因 -->
    <view class="row-textarea b-f m-top20">
      <view class="row-title">申请原因</view>
      <view class="content">
        <textarea class="textarea" v-model="formData.content" maxlength="2000" placeholder="请详细填写申请原因，注意保持商品的完好，建议您先与卖家沟通"
          placeholderStyle="color:#ccc"></textarea>
      </view>
    </view>

    <!-- 退款金额 -->
    <view v-if="formData.type == RefundTypeEnum.RETURN.value" class="row-money b-f m-top20 dis-flex">
      <view class="row-title">退款金额</view>
      <view class="money col-m">￥{{ goods.total_pay_price }}</view>
    </view>

    <!-- 上传凭证 -->
    <view class="row-voucher b-f m-top20">
      <view class="row-title">上传凭证 (最多6张)</view>
      <view class="image-list">
        <!-- 图片列表 -->
        <view class="image-preview" v-for="(image, imageIndex) in imageList" :key="imageIndex">
          <text class="image-delete iconfont icon-shanchu" @click="deleteImage(imageIndex)"></text>
          <image class="image" mode="aspectFill" :src="image.path"></image>
        </view>
        <!-- 上传图片 -->
        <view v-if="imageList.length < maxImageLength" class="image-picker" @click="chooseImage()">
          <text class="choose-icon iconfont icon-camera"></text>
          <text class="choose-text">上传图片</text>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="footer-fixed">
      <view class="btn-wrapper">
        <view class="btn-item btn-item-main" :class="{ disabled }" @click="handleSubmit()">确认提交</view>
      </view>
    </view>

  </view>
</template>

<script>
  import { RefundTypeEnum } from '@/common/enum/order/refund'
  import * as UploadApi from '@/api/upload'
  import * as RefundApi from '@/api/refund'

  const maxImageLength = 6

  export default {
    data() {
      return {
        // 枚举类
        RefundTypeEnum,
        // 正在加载
        isLoading: true,
        // 订单商品id
        orderGoodsId: null,
        // 订单商品详情
        goods: {},
        // 表单数据
        formData: {
          // 图片上传成功的文件ID集
          images: [],
          // 服务类型
          type: 10,
          // 申请原因
          content: ''
        },
        // 用户选择的图片列表
        imageList: [],
        // 最大图片数量
        maxImageLength,
        // 按钮禁用
        disabled: false
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad({ orderGoodsId }) {
      this.orderGoodsId = orderGoodsId
      // 获取订单商品详情
      this.getGoodsDetail()
    },

    methods: {

      // 获取订单商品详情
      getGoodsDetail() {
        const app = this
        app.isLoading = true
        RefundApi.goods(app.orderGoodsId)
          .then(result => {
            app.goods = result.data.goods
            app.isLoading = false
          })
      },

      // 切换类型
      onSwitchService(value) {
        this.formData.type = value
      },

      // 选择图片
      chooseImage() {
        const app = this
        const oldImageList = app.imageList
        // 选择图片
        uni.chooseImage({
          count: maxImageLength - oldImageList.length,
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success({ tempFiles }) {
            // tempFiles = [{path:'xxx', size:100}]
            app.imageList = oldImageList.concat(tempFiles)
          }
        });
      },

      // 删除图片
      deleteImage(imageIndex) {
        this.imageList.splice(imageIndex, 1)
      },

      // 表单提交
      handleSubmit() {
        const app = this
        const { imageList } = app
        // 判断是否重复提交
        if (app.disabled === true) return false
        // 表单验证
        if (!app.formData.content.trim().length) {
          app.$toast('请填写申请原因')
          return false
        }
        // 按钮禁用
        app.disabled = true
        // 判断是否需要上传图片
        if (imageList.length > 0) {
          app.uploadFile()
            .then(() => app.onSubmit())
            .catch(err => {
              app.disabled = false
              if (err.statusCode !== 0) {
                app.$toast(err.errMsg)
              }
              console.log('err', err)
            })
        } else {
          app.onSubmit()
        }
      },

      // 提交到后端
      onSubmit() {
        const app = this
        RefundApi.apply(app.orderGoodsId, app.formData)
          .then(result => {
            app.$toast(result.message)
            setTimeout(() => {
              app.disabled = false
              uni.navigateBack()
            }, 1500)
          })
          .catch(err => app.disabled = false)
      },

      // 上传图片
      uploadFile() {
        const app = this
        const { imageList } = app
        // 批量上传
        return new Promise((resolve, reject) => {
          if (imageList.length > 0) {
            UploadApi.image(imageList)
              .then(fileIds => {
                app.formData.images = fileIds
                resolve(fileIds)
              })
              .catch(reject)
          } else {
            resolve()
          }
        })
      }

    }
  }
</script>

<style lang="scss" scoped>
  .container {
    // 设置ios刘海屏底部横线安全区域
    padding-bottom: calc(constant(safe-area-inset-bottom) + 140rpx);
    padding-bottom: calc(env(safe-area-inset-bottom) + 140rpx);
  }

  .row-title {
    color: #888;
    margin-bottom: 20rpx;
  }

  // 商品信息
  .goods-detail {
    padding: 24rpx 20rpx;

    .left {
      .goods-image {
        display: block;
        width: 150rpx;
        height: 150rpx;
      }
    }

    .right {
      padding-left: 20rpx;
    }

      .goods-props {
        margin-top: 14rpx;
        color: #ababab;
        font-size: 24rpx;
        overflow: hidden;

        .goods-props-item {
          padding: 4rpx 16rpx;
          border-radius: 12rpx;
          background-color: #fcfcfc;
        }
      }
  }

  /* 服务类型 */
  .row-service {
    padding: 24rpx 20rpx;
  }

  .service-switch {
    .switch-item {
      padding: 6rpx 30rpx;
      margin-right: 25rpx;
      border-radius: 10rpx;
      border: 1px solid rgb(177, 177, 177);
      color: #888888;

      &.active {
        color: $main-bg;
        border: 1px solid $main-bg;
      }
    }
  }

  /* 申请原因 */
  .row-textarea {
    padding: 24rpx 20rpx;

    .textarea {
      width: 100%;
      height: 220rpx;
      padding: 12rpx;
      border: 1rpx solid #e8e8e8;
      border-radius: 5rpx;
      box-sizing: border-box;
      font-size: 26rpx;
    }
  }

  /* 退款金额 */
  .row-money {
    padding: 24rpx 20rpx;

    .row-title {
      margin-bottom: 0;
      margin-right: 30rpx;
    }
  }

  // 上传凭证
  .row-voucher {
    padding: 24rpx 20rpx;

    .image-list {
      padding: 0 20rpx;
      margin-top: 20rpx;
      margin-bottom: -20rpx;

      &:after {
        clear: both;
        content: " ";
        display: table;
      }

      .image {
        display: block;
        width: 100%;
        height: 100%;
      }

      .image-picker,
      .image-preview {
        width: 184rpx;
        height: 184rpx;
        margin-right: 30rpx;
        margin-bottom: 30rpx;
        float: left;

        &:nth-child(3n+0) {
          margin-right: 0;
        }
      }

      .image-picker {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border: 1rpx dashed #ccc;
        color: #ccc;

        .choose-icon {
          font-size: 48rpx;
          margin-bottom: 6rpx;
        }

        .choose-text {
          font-size: 24rpx;
        }
      }

      .image-preview {
        position: relative;

        .image-delete {
          position: absolute;
          top: -15rpx;
          right: -15rpx;
          height: 42rpx;
          width: 42rpx;
          background: rgba(0, 0, 0, 0.64);
          border-radius: 50%;
          color: #fff;
          font-weight: bolder;
          font-size: 22rpx;
          z-index: 10;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }

  // 底部操作栏
  .footer-fixed {
    position: fixed;
    bottom: var(--window-bottom);
    left: 0;
    right: 0;
    z-index: 11;

    // 设置ios刘海屏底部横线安全区域
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);

    .btn-wrapper {
      height: 140rpx;
      display: flex;
      align-items: center;
      padding: 0 20rpx;
    }

    .btn-item {
      flex: 1;
      font-size: 28rpx;
      height: 80rpx;
      color: #fff;
      border-radius: 50rpx;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .btn-item-main {
      background: linear-gradient(to right, $main-bg, $main-bg2);
      color: $main-text;

      // 禁用按钮
      &.disabled {
        opacity: 0.6;
      }
    }

  }
</style>
