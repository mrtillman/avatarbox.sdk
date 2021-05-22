# AvbxTwitterClient

|Method|Description|
|---|---|
|`sync(twitterProfile)`|updates the local [TwitterProfile](https://github.com/mrtillman/avatarbox.sdk/blob/master/Domain/twitter-profile.ts) <sup>a.</sup>|
|`fetch(id)`|finds a *TwitterProfile* by `id`|
|`isActive(id)`|returns a boolean value indicating whether or not auto updates are enabled|
|`on(id)`|enable auto updates for a Twitter user|
|`off(id)`|disable auto updates for a Twitter user|
|`delete(ids)`|deletes one or more *TwitterProfiles*|
|`collect()`|returns a list of all Twitter icons in the [Ready State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#ready-state)|
|`peek()`|returns a list of all Twitter icons in the [Fresh State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#fresh-state)|
|`dig()`|returns a list of all Twitter icons in the [Cold State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#cold-state)|
|`touch(icon)`|sends an SQS message to [avatarbox.worker](https://github.com/mrtillman/avatarbox.worker)|
|`reset(icon)`|resets the timestamp indicating when the Twitter icon was last updated |

> a. The the *TwitterProfile* represents the [User object](https://developer.twitter.com/en/docs/twitter-api/data-dictionary/object-model/user) returned from the Twitter API during authentication. It is stored locally in DynamoDB and updated after each login.