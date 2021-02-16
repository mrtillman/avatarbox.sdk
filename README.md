# avatarbox.sdk

 nodejs sdk for [avatarbox.io](https://avatarbox.io)
 
 ---

<!--
[![Build Status](https://travis-ci.com/mrtillman/grav.client.svg?branch=master)](https://travis-ci.com/mrtillman/grav.client)
[![Coverage Status](https://coveralls.io/repos/github/mrtillman/grav.client/badge.svg?branch=master)](https://coveralls.io/github/mrtillman/grav.client?branch=master)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/mrtillman/grav.client?sort=semver)](https://github.com/mrtillman/grav.client/releases/tag/2.4.19)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mrtillman/grav.client/blob/master/LICENSE.md)

[![NPM](https://nodei.co/npm/grav.client.png)](https://www.npmjs.com/package/grav.client)
-->

## Description

**avatarbox.sdk** was designed to facilitate the development of application components such as [avatarbox.publisher](https://github.com/mrtillman/avatarbox.publisher) and [avatarbox.worker](https://github.com/mrtillman/avatarbox.worker), however it also supports [avatarbox.app](https://github.com/mrtillman/avatarbox.app) and [avatarbox.api](https://github.com/mrtillman/avatarbox.api).

## Checklist

- DynamoDB table called `Gravatars` with `email` as the partition key
- KMS Symmetric Key
- SQS Queue

*SQS Queue Setup:*

|Setting|Description|
|---|---|
|Delivery Delay|3 Seconds <sup>a.</sup>|
|Lambda Triggers|`avbx-worker` <sup>b.</sup>|
|Name|`avbx-worker-queue`|
|Type|Standard|

> a. Postpone delivery of new messages to avoid [cold start issues](https://github.com/mrtillman/avatarbox.worker/wiki/Resolving-Cold-Start-Issues). <br/>b. Use [avatarbox.worker](https://github.com/mrtillman/avatarbox.worker) to define this Lambda function.

## Installation

```sh
# clone repo
$ git clone https://github.com/mrtillman/avatarbox.sdk.git

# install dependencies
$ cd avatarbox.sdk && npm install
```

Next, find [.env.demo](https://github.com/mrtillman/avatarbox.sdk/blob/master/.env.demo), rename it to `.env` and set the values:

```sh
KMS_KEY_ID={YOUR-KMS-KEY-ID}
REGION=us-east-1
QUEUE_URL={YOUR-SQS-QUEUE-URL}
```

<!--
## Tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```
-->

## Usage

```js
import { AvbxGravatarClient } from 'avatarbox.sdk';

const client = new AvbxGravatarClient();
```

## Client Methods

|Method|Description|
|---|---|
|`login(email, password)`|authenticates a Gravatar user and returns an instance of [GravatarClient](https://github.com/mrtillman/grav.client)|
|`fetch(email)`|pulls a Gravatar user from storage and returns an instance of *GravatarClient*|
|`on(email)`|enable auto updates for a Gravatar user|
|`off(email)`|disable auto updates for a Gravatar user|
|`delete(emails)`|deletes one or more Gravatar users from storage|
|`collect()`|returns a list of all Gravatars in the [Ready State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#ready-state)|
|`peek()`|returns a list of all Gravatars in the [Fresh State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#fresh-state)|
|`dig()`|returns a list of all Gravatars in the [Cold State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#cold-state)|
|`purge()`|removes all Gravatars in the [Cold State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#cold-state)|
|`touch(email)`|sends an SQS message to [avatarbox.worker](https://github.com/mrtillman/avatarbox.worker)|
|`renew(email)`|sets the timestamp indicating when the Gravatar icon was last updated|

## License

[MIT](https://github.com/mrtillman/avatarbox.sdk/blob/master/LICENSE)
