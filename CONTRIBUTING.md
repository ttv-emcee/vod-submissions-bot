# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
or by reaching out to apooooop#6969 or one of the discord mods in The Thunderdome.

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Setting up the dev environment

In `src/config`, you will need both a `config.ts`, and a `secrets/vod-submissions-bot.json`.
The `config.ts` can be copied and populated from the `config.dev.ts`. If you request the
`secrets/vod-submissions-bot.json` from Anup, then the `config.dev.ts` will work out of the box,
and will require no modification; otherwise, contact Anup for instructions in populating the fields.

We use [asdf-vm](https://github.com/asdf-vm/asdf) to track the node version we're using. If you're
not using asdf, you can just consult the `.tool-versions` file in the root level of this repo to
find the correct node version (it'll probably just be latest).

We use eslint and prettier to ensure that code formatting and basic style are not a significant
discussion as part of code reviewing. If you have recommendations for options, for either, please
bring them up!

We use [io-ts](https://github.com/gcanti/io-ts) to decode incoming information, so that our system
can be fully typesafe. Feel free to reach out if you have any questions regarding this library.

## Pull Request Process

1. Ensure any secrets are not committed.
2. Update README or other relevant documentation regarding changes to API.
   1. Changes to the Google Sheet need to be carefully managed with both backwards compatability /
      migrations in mind, as well as dealing with rollout considerations.
      Remember, rollout occurs when Emcee starts using our tool, not sooner.
3. You may merge the Pull Request in once you have the sign-off of any of the Maintainers,
   or, if you do not have permissions to do that, you may ask the reviewer to merge it themselves.
