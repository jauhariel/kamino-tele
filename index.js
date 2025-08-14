(async function start() {
  const { spawn } = await import("child_process");

  const child = spawn(process.argv0, ["main.js", ...process.argv.slice(2)], {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  })
    .on("message", (msg) => {
      if (msg === "restart") {
        child.kill();
        start();
      }
      if (msg === "exit") {
        child.kill();
      }
    })
    .on("exit", (code) => {
      if (code) {
        start();
      }
    })
    .on("error", console.log);
})();
