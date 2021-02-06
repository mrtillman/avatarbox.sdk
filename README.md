# avatarbox.sdk

 A NodeJS SDK for [avatarbox.io](https://avatarbox.io)
 
 ---

<!--
[![Build Status](https://travis-ci.com/mrtillman/grav.client.svg?branch=master)](https://travis-ci.com/mrtillman/grav.client)
[![Coverage Status](https://coveralls.io/repos/github/mrtillman/grav.client/badge.svg?branch=master)](https://coveralls.io/github/mrtillman/grav.client?branch=master)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/mrtillman/grav.client?sort=semver)](https://github.com/mrtillman/grav.client/releases/tag/2.4.19)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mrtillman/grav.client/blob/master/LICENSE.md)

[![NPM](https://nodei.co/npm/grav.client.png)](https://www.npmjs.com/package/grav.client)
-->

## Checklist

- KMS Symmetric Key
- SQS Queue
- DynamoDB table called `Gravatars` with `email` as sort key

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
|`login(email, password)`|authenticates a Gravatar user, stores that user, and then returns an instance of [GravatarClient](https://github.com/mrtillman/grav.client)|
|`fetch(email)`|pulls a Gravatar user from storage, and then returns an instance of *GravatarClient*|
|`on(email)`|enable auto updates for a Gravatar user|
|`off(email)`|disable auto updates for a Gravatar user|
|`delete(emails)`|removes one or more Gravatar users from storage|
|`collect()`|returns a list of email addresses for all Gravatar icons not updated in the past 24 hours|
|`purge(days)`|removes all Gravatar users not updated in the past "x" number of days|
|`touch(email)`|sends an SQS message to the Lambda worker that auto updates Gravatar icons|
|`renew(email)`|alters the timestamp indicating when the Gravatar icon was last updated|

## License
[MIT](https://github.com/mrtillman/avatarbox.sdk/blob/master/LICENSE)
