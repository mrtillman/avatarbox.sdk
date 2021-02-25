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

**avatarbox.sdk** is a specialized library designed to facilitate the development of internal application components such as [avatarbox.publisher](https://github.com/mrtillman/avatarbox.publisher), [avatarbox.worker](https://github.com/mrtillman/avatarbox.worker), [avatarbox.app](https://github.com/mrtillman/avatarbox.app) and [avatarbox.api](https://github.com/mrtillman/avatarbox.api). Unlike a general-purpose library, **avatarbox.sdk** is tailored for back-end resources situated within the AvatarBox [Virtual Private Clouds (VPCs)](https://aws.amazon.com/vpc/?vpc-blogs.sort-by=item.additionalFields.createdDate&vpc-blogs.sort-order=desc) hosted on [Amazon Web Services (AWS)](https://en.wikipedia.org/wiki/Amazon_Web_Services).

## Checklist

- DynamoDB table: `Gravatars` 
  - partition key: `email`
  - [Global Secondary Index](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html) 
    - name: `index-id-email`
    - partition key: `id (Number)` 
    - sort key: `email (String)`
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

Next, find [.env.demo](https://github.com/mrtillman/avatarbox.sdk/blob/master/.env.demo), rename it to `.env` and modify:

```sh
KMS_KEY_ID={YOUR-KMS-KEY-ID}
REGION=us-east-1
QUEUE_URL={YOUR-SQS-QUEUE-URL}
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=mrtillman
MYSQL_PASSWORD=letmein
MYSQL_DATABASE=gravatar
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
|`login(email,password)`|authenticates a Gravatar user and returns an instance of [GravatarClient](https://github.com/mrtillman/grav.client)|
|`fetch(id\|email)`|finds a Gravatar user by `id` or `email` and returns an instance of *GravatarClient*|
|`on(email)`|enable auto updates for a Gravatar user|
|`off(email)`|disable auto updates for a Gravatar user|
|`delete(users)`|deletes one or more [GravatarUser](https://github.com/mrtillman/avatarbox.sdk/blob/master/Domain/gravatar-user.ts)s from storage|
|`collect()`|returns a list of all Gravatars in the [Ready State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#ready-state)|
|`peek()`|returns a list of all Gravatars in the [Fresh State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#fresh-state)|
|`dig()`|returns a list of all Gravatars in the [Cold State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#cold-state)|
|`sweep()`|removes all Gravatars in the *Cold State*|
|`touch(email)`|sends an SQS message to [avatarbox.worker](https://github.com/mrtillman/avatarbox.worker)|
|`reset(icon)`|resets the timestamp indicating when the [GravatarIcon](https://github.com/mrtillman/avatarbox.sdk/blob/master/Domain/gravatar-icon.ts) was last updated |

## License

[MIT](https://github.com/mrtillman/avatarbox.sdk/blob/master/LICENSE)
