# Changesets

Add a changeset for every user-, developer-, operator-, security-, or compatibility-visible change:

```sh
npm run changeset
```

Choose the semantic version impact and describe the observable change. Changesets are consumed by `npm run version`, which updates `package.json` and `CHANGELOG.md` for review before a release tag is created.

Do not add a changeset for internal work that has no release-visible effect.
