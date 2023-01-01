import path from "node:path";
import yargs from "yargs/yargs";

import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { unlink } from "node:fs/promises";

const main = async () => {
  const filePath = await parseArgs();
  const fileUrl = pathToFileURL(filePath).toString();
  const hash = createHash("md5").update(fileUrl).digest("hex");

  const sizes = ["large", "normal"];
  const cacheFolders = sizes.map(
    (size) => `${homedir}/.cache/thumbnails/${size}`
  );

  await Promise.all(
    cacheFolders.map(async (cacheFolder) => {
      try {
        await deleteThumbnail(hash, cacheFolder);
        console.info(`Deleted thumbnail under ${cacheFolder}`);
      } catch (error) {
        if (isError(error)) {
          console.error(error.message);
          process.exitCode = 1;
        }
      }
    })
  );
};

const deleteThumbnail = async (hash: string, cacheFolder: string) => {
  const thumbnailPath = `${cacheFolder}/${hash}.png`;

  try {
    await unlink(thumbnailPath);
  } catch (error) {
    if (isError(error) && error.code === "ENOENT") {
      throw new Error(`No thumbnail found under ${cacheFolder}`);
    } else if (isError(error) && error.code === "EPERM") {
      throw new Error(
        `Unable to delete thumbnail under ${cacheFolder}: ` +
          "Operation not permitted"
      );
    }
  }
};

const parseArgs = async () => {
  const usageMessage = "Usage: $0 [FILE]\nDeletes the thumbnails of FILE.";
  const minMessage = "The FILE location is missing";

  const parser = yargs(process.argv.slice(2))
    .strict()
    .string("-")
    .demandCommand(1, minMessage)
    .usage(usageMessage);

  const [filePath] = (await parser.argv)._;
  return path.resolve(String(filePath));
};

const isError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error;

export { main };