# avatarbox.sdk

 nodejs sdk for [avatarbox.io](https://avatarbox.io)
 
 ---

[![Build Status](https://travis-ci.com/mrtillman/avatarbox.sdk.svg?branch=master)](https://travis-ci.com/mrtillman/avatarbox.sdk)
[![Coverage Status](https://coveralls.io/repos/github/mrtillman/avatarbox.sdk/badge.svg?branch=master)](https://coveralls.io/github/mrtillman/avatarbox.sdk?branch=master)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/mrtillman/avatarbox.sdk?sort=semver)](https://github.com/mrtillman/avatarbox.sdk/releases/tag/1.1.1)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mrtillman/avatarbox.sdk/blob/master/LICENSE)

[![NPM](https://nodei.co/npm/avatarbox.sdk.png)](https://www.npmjs.com/package/avatarbox.sdk)

## Description

**avatarbox.sdk** is a specialized library designed to facilitate the development of internal application components such as [avatarbox.publisher](https://github.com/mrtillman/avatarbox.publisher), [avatarbox.worker](https://github.com/mrtillman/avatarbox.worker), [avatarbox.app](https://github.com/mrtillman/avatarbox.app) and [avatarbox.api](https://github.com/mrtillman/avatarbox.api). Unlike a general-purpose library, **avatarbox.sdk** is tailored to back-end resources situated within the AvatarBox [Virtual Private Cloud (VPC)](https://aws.amazon.com/vpc/?vpc-blogs.sort-by=item.additionalFields.createdDate&vpc-blogs.sort-order=desc) hosted on [Amazon Web Services (AWS)](https://en.wikipedia.org/wiki/Amazon_Web_Services).

## Checklist
- [Pusher Channel](https://pusher.com/channels)
- DynamoDB table: `Gravatars` 
  - partition key: `email`
  - [Global Secondary Index](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html) 
    - name: `index-id-email`
    - partition key: `id (Number)` 
    - sort key: `email (String)`
- DynamoDB table: `TwitterProfiles` 
    - partition key: `id`
- KMS Symmetric Key
- MySQL table: [gravatar.users](https://github.com/mrtillman/avatarbox.sdk/blob/master/gravatar.users.sql) <sup>a.</sup>
- SQS Queue

*SQS Queue Setup:*

|Setting|Description|
|---|---|
|Lambda Triggers|`avbx-worker` <sup>b.</sup>|
|Name|`avbx-worker-queue`|
|Type|Standard|

> a. This table establishes a [database connection](https://auth0.com/docs/connections/database) that supports the [Auth0 Integration](https://github.com/mrtillman/avatarbox.api/wiki/Auth0-Integration).<br/> b. Use [avatarbox.worker](https://github.com/mrtillman/avatarbox.worker) to define this Lambda function.

## Installation

```sh
# clone repo
$ git clone https://github.com/mrtillman/avatarbox.sdk.git

# install dependencies
$ cd avatarbox.sdk && npm install
```

Next, find [demo.env](https://github.com/mrtillman/avatarbox.sdk/blob/master/demo.env), rename it to `.env` and modify:

```sh
KMS_KEY_ID={YOUR-KMS-KEY-ID}
REGION=us-east-1
QUEUE_URL={YOUR-SQS-QUEUE-URL}
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=mrtillman
MYSQL_PASSWORD=letmein
MYSQL_DATABASE=gravatar
SALT={BCRYPT-SALT}
PUSHER_APP_ID=0000000
PUSHER_SECRET=xxxxxxxxxxxxxxxxxxx
PUSHER_KEY=11111112222222333333
PUSHER_CLUSTER=xx1
```

## Tests

```bash
# unit tests
$ npm test

# test coverage
$ npm run test:cov
```

## Usage

**avatarbox.sdk** defines a [Gravatar client](https://github.com/mrtillman/avatarbox.sdk/blob/master/Presentation/Clients/gravatar-client.md#avbxgravatarclient) and a [Twitter client](https://github.com/mrtillman/avatarbox.sdk/blob/master/Presentation/Clients/twitter-client.md#avbxtwitterclient). Both implement the [AvbxClient interface](https://github.com/mrtillman/avatarbox.sdk/blob/master/Domain/avbx-client.ts).

```js
import { 
  AvbxGravatarClient,
  AvbxTwitterClient
} from 'avatarbox.sdk';

const gravatarClient = new AvbxGravatarClient();
const twitterClient = new AvbxTwitterClient();
```

## License

[MIT](https://github.com/mrtillman/avatarbox.sdk/blob/master/LICENSE)
