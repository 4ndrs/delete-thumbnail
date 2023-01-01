# delete-thumbnail

Removes the specified file's thumbnails found in the local cache directory.

## Building & installing

```console
$ git clone https://github.com/4ndrs/delete-thumbnail.git
$ cd delete-thumbnail
$ npm ci
$ npm run build
# npm install -g .
````

## Usage

```console
$ delete-thumbnail /tmp/Videos/Punkjack.webm
No thumbnail found under /home/user/.cache/thumbnails/normal
Deleted thumbnail under /home/user/.cache/thumbnails/large
```
