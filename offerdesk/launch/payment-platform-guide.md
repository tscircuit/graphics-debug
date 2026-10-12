# 全自动收款平台填写指南

目标：买家付款后，平台自动收款、自动发授权码，买家回到 OfferDesk 输入授权码后自动解锁。

当前支付宝个人收款码只能解决“收钱入口”，不能自动确认付款，也不能自动发授权码。它只能当备用方案。

## 首选方案：Lemon Squeezy

原因：

- 支持一次性购买。
- 支持平台可用的支付宝、微信支付、银行卡、PayPal。
- 支持购买后自动生成授权码。
- 收据邮件里能自动显示授权码。

配置步骤：

1. 创建产品：OfferDesk 报价单赚钱助手。
2. 产品类型：Single payment。
3. 价格：29 CNY，或平台允许的等值价格。
4. 开启 Generate license keys。
5. Activation limit：建议先填 1。
6. Receipt email / Button link 填：

```text
https://8npyvz5bd8-lang.github.io/graphics-debug/offerdesk/?license_key=[license_key]&email=[email]&order_id=[order_id]
```

7. 复制 checkout URL。
8. 复制 product ID。如果只有一个规格，variant ID 可以先空着。

写入项目配置：

```bash
/Users/chenzhifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/configure-lemonsqueezy.mjs \
  --auto-checkout-url "Lemon Squeezy checkout URL" \
  --product-id "Lemon Squeezy product ID" \
  --fallback-license-code "本地备用测试授权码"
```

如果有 variant ID，再加：

```bash
  --variant-id "Lemon Squeezy variant ID"
```

检查是否已经全自动：

```bash
/Users/chenzhifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate-auto-payment.mjs
```

必须失败数为 0，才算真正全自动收款。

## 备用方案：支付宝收款码

当前项目已接入支付宝收款码：`launch/payment-alipay.jpeg`。

配置方式：

```bash
/Users/chenzhifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/write-config.mjs \
  --checkout-url "https://8npyvz5bd8-lang.github.io/graphics-debug/offerdesk/buy.html" \
  --payment-qr-image "./launch/payment-alipay.jpeg" \
  --license-code "发给买家的授权码" \
  --support-email "534403209@qq.com"
```

这个方案不是全自动。付款后仍要用 `scripts/create-delivery-email.mjs` 生成邮件或手动发送授权码。

## 推荐优先级

1. Lemon Squeezy：最适合当前产品，自动收款、自动发授权码。
2. Stripe Payment Links：适合已有 Stripe 账号的人，但授权码通常还要接 webhook 或自动化工具。
3. 支付宝收款码：最快，但只能人工发码。
4. Gumroad：适合先验证付费意愿，但支付宝/微信支付不如 Lemon Squeezy 直接。

当前付款后提交信息页：

```text
https://8npyvz5bd8-lang.github.io/graphics-debug/offerdesk/after-pay.html
```

只有用支付宝收款码时，才需要把这个链接发给已付款买家。买家填写付款时间、邮箱和支付宝昵称后，会自动生成邮件给客服邮箱。

## Gumroad

官方入口：https://gumroad.com/help/article/149-adding-a-product

填写方式：

- Product type：Digital product。
- Name：OfferDesk 报价单赚钱助手。
- Price：29 元或等值外币。
- Description：复制 `launch/product-page-fields.md` 的短介绍和详细介绍。
- Cover / media：上传 `launch/offerdesk-screenshot.jpg`。
- Content：放线上地址、授权码交付说明，或复制 `launch/buyer-guide.md`。
- After purchase email：复制 `scripts/create-delivery-email.mjs` 生成的内容。

拿到产品链接后，把它当作真实付款链接。

## Stripe Payment Links

官方入口：https://docs.stripe.com/payment-links/create

填写方式：

- Product：OfferDesk 报价单赚钱助手。
- Price：一次性价格，29 元或等值外币。
- Payment page：开启需要的付款方式。
- After payment：显示线上地址和客服邮箱；授权码需要你通过邮件或手动发给买家。

创建后复制 Payment Link。这个链接就是 `checkoutUrl`。

## 发布前检查

每次改配置后运行：

```bash
/Users/chenzhifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate-release.mjs
/Users/chenzhifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate-auto-payment.mjs
```

两个命令都失败数为 0，才能说已经接入全自动收款。

## 生成付款后邮件

部署完成后运行：

```bash
/Users/chenzhifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/create-delivery-email.mjs \
  --app-url "线上地址" \
  --license-code "发给买家的授权码" \
  --support-email "客服邮箱"
```

把输出内容复制到收款平台的付款后邮件里。这个输出包含明文授权码，不要放进网页发布包。
