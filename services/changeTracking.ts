// let unsavedChanges = false;
// function markChanged(): void {
//   unsavedChanges = true;
// }
// function markSaved(): void {
//   unsavedChanges = false;
// }
// useEffect(() => {
//   window.addEventListener("beforeunload", () => {
//     if (unsavedChanges) {
//       return "Would you like to discard changes";
//     }
//   });
//   Router.events.on("routeChangeStart", () => {
//     const ok = confirm(
//       "You have unsaved changes. Do you really want to leave?"
//     );
//     if (!ok) {
//       Router.events.emit("routeChangeError");
//       throw new Error("Abort route change. Please ignore this error.");
//     }
//   });
// }, []);

export function registerHandlers(): void { }

export function markChanged(): void { }
export function markSaved(): void { }
