# Clip to Github

This webextension will upload the contents of your clipboard (and potentially more things in the future) to a GitHub repository of your choice. The contents of the clipboard are uploaded to a Markdown file in the chosen folder. The file's name is the current date in ISO format. You may choose whether the browser should immediately open that page.

## How to use

After installing the extension, click on the 📎 button.
After that, click `Add new target` and fill in these fields:

- `GitHub user/repo`: this field contains a string formed of `[username]/[repoName]`. For example `valenting/clip_to_gh`.
- `Repository path`: this optional field contains a string with the path of a directory in your repo where files should be placed.
- `Github token`: this string contains an authentication token needed to upload files to the specified GitHub repo.
- `Open page after upload`: checking this box will open the github page in a new tab after a successful upload.

After filling in these fields click `Save Target`.

Clicking the button for that entry will then upload the contents of your clipboard to GitHub.

### Generating a token

You can either generate a general github token with the `repo` scope at [this link](https://github.com/settings/tokens/new) or preferrably generate a fine grained token for `Only select repositories` with `Contents: read/write` permission for the specific repo you are targetting at [this link](https://github.com/settings/personal-access-tokens/new)

See the Github documentation page for more info:
https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

## Repository path

This is the path in the repo where the file with the contents of your clipboard will be placed.
It can be an empty string, in which case your file will be placed in the root of your repo.

| Repository path string | End result                             | Explanation                                                                                 |
| ---------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| (empty string)         | 2024-02-04T17:14:11.626Z.md            | The file name is (new Date()).toISOString()}.md                                             |
| folder/sub             | folder/sub/2024-02-04T17:14:11.626Z.md | The date is put in specified folder                                                         |
| folder/sub/            | folder/sub/2024-02-04T17:14:11.626Z.md | Also treated as a folder because it ends in /                                                                                             |
| /folder/sub            | folder/sub/2024-02-04T17:14:11.626Z.md | Leading / is removed                                                                        |
| folder/%YYYY/          | folder/2024/clipboard.md               | YYYY is replaced with current year. Since it's a folder, a clipboard.md file name is added. |
| folder/%YYYY           | folder/2024.md                         | Doesn't end in /, so it's treated as a file name. .md is added.                             |
| folder/notes-%YYYY-%MM-%DD.md                       | folder/notes-2024-02-04.md                                       | Patterns are replaced. Already ends in .md so not suffix is added.                                                                                            |

### Replacement patterns

| Pattern | Replacement | Explanation |
| ------- | ----------- | ----------- |
| %YYYY   | 2024        | Year        |
| %MM     | 02          | Month       |
| %DD     | 04          | Day         |
| %HH     | 17          | Hour        |
| %mm     | 14          | Minutes     |
| %ss     | 11          | Seconds     |
| %sss        | 626            | Milliseconds            |



## Roadmap

This is a personal project that may or may not end up getting maintained for long. However, there are some features I think may be useful.

- [x] Upload clipboard to GitHub.
- [x] Convert rich text / HTML to markdown before uploading (only works on Firefox Nightly)
- [ ] Right click option to upload selection to GitHub without copying to clipboard.
- [ ] Option to edit contents before upload to GitHub.
- [x] Better naming scheme for files. Provide a pattern that is filled in.
- [ ] Add ability to overwrite existing files.


## Contributing

Fork this repo and send PRs.
