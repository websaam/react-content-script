export const log = (...args: any) => {
  // console.log("[\x1b[33m%s\x1b[0m]", "DocuQuest", ...args);
  // console.log(LitLogger.orange + this.PREFIX + LitLogger.reset, ...args);
  console.log("\x1b[33m%s\x1b[0m", "[DocuQuest]", ...args);
  // translate this color to FA9802 to cli color
  // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
};
