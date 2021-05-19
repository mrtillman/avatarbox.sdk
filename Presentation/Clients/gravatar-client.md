# AvbxGravatarClient

|Method|Description|
|---|---|
|`login(email,password)`|authenticates a Gravatar user and returns an instance of [GravatarClient](https://github.com/mrtillman/grav.client)|
|`fetch(id\|email)`|finds a Gravatar user by `id` or `email` and returns an instance of *GravatarClient*|
|`isActive(id\|email)`|returns a boolean value indicating whether or not auto updates are enabled|
|`on(email)`|enable auto updates for a Gravatar user|
|`off(email)`|disable auto updates for a Gravatar user|
|`delete(users)`|deletes one or more [GravatarUser](https://github.com/mrtillman/avatarbox.sdk/blob/master/Domain/gravatar-user.ts)s|
|`collect()`|returns a list of all Gravatar icons in the [Ready State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#ready-state)|
|`peek()`|returns a list of all Gravatar icons in the [Fresh State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#fresh-state)|
|`dig()`|returns a list of all Gravatar icons in the [Cold State](https://github.com/mrtillman/avatarbox.sdk/wiki/Glossary#cold-state)|
|`touch(id\|email)`|sends an SQS message to [avatarbox.worker](https://github.com/mrtillman/avatarbox.worker)|
|`reset(icon)`|resets the timestamp indicating when the [GravatarIcon](https://github.com/mrtillman/avatarbox.sdk/blob/master/Domain/gravatar-icon.ts) was last updated |