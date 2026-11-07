import { Dock } from "./Dock";

/** Mobile navigation: the liquid-glass dock floating above the home indicator. */
export function TabBar() {
  return (
    <div className="pb-safe pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 lg:hidden">
      <div className="pointer-events-auto mb-2.5">
        <Dock placement="bottom" />
      </div>
    </div>
  );
}
