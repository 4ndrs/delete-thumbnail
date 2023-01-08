import path from "node:path";
import yargs from "yargs/yargs";

import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { unlink } from "node:fs/promises";

const main = async () => {
  const filePaths = await parseArgs();
  const fileUrls = filePaths.map((filePath) =>
    pathToFileURL(filePath).toString()
  );

  const sizes = ["large", "normal"];
  const cacheDirs = sizes.map((size) => `${homedir}/.cache/thumbnails/${size}`);

  await Promise.all(
    fileUrls.map((fileUrl) => processFileUrl(fileUrl, cacheDirs))
  );
};

const processFileUrl = async (fileUrl: string, cacheDirs: Array<string>) => {
  const hash = createHash("md5").update(fileUrl).digest("hex");

  await Promise.all(
    cacheDirs.map(async (cacheDir) => {
      try {
        await deleteThumbnail(hash, cacheDir);
        console.info(`Deleted thumbnail under ${cacheDir}`);
      } catch (error) {
        if (isError(error)) {
          console.error(error.message);
          process.exitCode = 1;
        }
      }
    })
  );
};

const deleteThumbnail = async (hash: string, cacheDir: string) => {
  const thumbnailPath = `${cacheDir}/${hash}.png`;

  try {
    await unlink(thumbnailPath);
  } catch (error) {
    if (isError(error) && error.code === "ENOENT") {
      throw new Error(`No thumbnail found under ${cacheDir}`);
    } else if (isError(error) && error.code === "EPERM") {
      throw new Error(
        `Unable to delete thumbnail under ${cacheDir}: ` +
          "Operation not permitted"
      );
    } else {
      throw error;
    }
  }
};

const parseArgs = async () => {
  const usageMessage = "Usage: $0 [FILE...]\nDeletes the thumbnails of FILEs.";
  const minMessage = "The FILE location is missing";

  const parser = yargs(process.argv.slice(2))
    .strict()
    .string("-")
    .demandCommand(1, minMessage)
    .usage(usageMessage);

  const filePaths = Array.from(new Set((await parser.argv)._));
  return filePaths.map((filePath) => path.resolve(String(filePath)));
};

const isError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error;

export { main };
