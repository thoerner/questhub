import { signIn } from "@/auth";
import { TopBar } from "@/components/rpg/top-bar";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
    <TopBar />
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-4">
          <div
            className="font-display text-accent text-2xl leading-none"
            aria-hidden="true"
          >
            ⚔
          </div>
          <h1 className="font-display text-lg text-accent-gold glow-gold tracking-widest leading-none">
            ENTER THE GUILD
          </h1>
          <p className="text-text-muted text-xs font-display tracking-wider">
            Authenticate to unlock private quests.
          </p>
        </div>

        <div className="ornate-border rounded-sm bg-surface-raised p-8 space-y-6">
          <p className="text-text-secondary text-sm leading-relaxed">
            Sign in with GitHub to access private repositories and your personal
            quest dashboard.
          </p>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full px-4 py-3 font-display text-xs tracking-wider border-2 border-accent-gold text-accent-gold bg-transparent rounded-sm hover:bg-accent-gold hover:text-surface transition-colors cursor-pointer"
            >
              ◆ SIGN IN WITH GITHUB ◆
            </button>
          </form>

          <p className="text-[10px] text-text-muted">
            Public repositories are always accessible without login.
          </p>
        </div>

        <div className="flex justify-center gap-4 text-[8px] text-text-muted font-display tracking-wider">
          <span>v2.0.0</span>
          <span className="text-accent-gold-dim">◈</span>
          <span>PHASE 2: GUILD ACCESS</span>
        </div>
      </div>
    </div>
    </div>
  );
}
