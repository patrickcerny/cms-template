import { isAdminAuthenticated, loginAction, logoutAction } from "./actions";
import { SiteContentEditor } from "./SiteContentEditor";
import { getCmsDictionary } from "@/lib/cms-dictionary";
import { locales } from "@/i18n/config";
import styles from "./Admin.module.scss";

type AdminPageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const authenticated = await isAdminAuthenticated();
  const params = await searchParams;

  if (!authenticated) {
    return (
      <main className={styles.page}>
        <form action={loginAction} className={styles.login}>
          <h1>Admin</h1>
          {params.error && <div className={styles.error}>Wrong password.</div>}
          <label className={styles.field}><span>Password</span><input name="password" type="password" required /></label>
          <button className={styles.button} type="submit">Sign in</button>
        </form>
      </main>
    );
  }

  // The editor edits every locale at once, seeded with the current merged content.
  const initialContent = Object.fromEntries(
    locales.map((locale) => [locale, getCmsDictionary(locale)]),
  ) as Parameters<typeof SiteContentEditor>[0]["initialContent"];

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.top}>
          <div>
            <p>Content Management</p>
            <h1>Edit site content</h1>
          </div>
          <form action={logoutAction}><button className={styles.logout} type="submit">Logout</button></form>
        </div>

        {params.saved && <div className={styles.success}>Content saved.</div>}
        {params.error && <div className={styles.error}>Could not save. Check the content and try again.</div>}

        <SiteContentEditor initialContent={initialContent} />
      </div>
    </main>
  );
}
