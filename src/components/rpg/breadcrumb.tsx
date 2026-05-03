import Link from "next/link";

type BreadcrumbProps = {
  owner: string;
  repo: string;
  branch: string;
  path: string;
  isFile?: boolean;
};

export function Breadcrumb({
  owner,
  repo,
  branch,
  path,
  isFile = false,
}: BreadcrumbProps) {
  const segments = path ? path.split("/") : [];
  const base = `/repo/${owner}/${repo}`;

  return (
    <nav className="flex items-center gap-1 text-sm flex-wrap">
      <Link
        href={base}
        className="text-accent-gold hover:text-accent transition-colors font-medium"
      >
        {repo}
      </Link>

      {segments.map((segment, i) => {
        const isLast = i === segments.length - 1;
        const segmentPath = segments.slice(0, i + 1).join("/");
        const href = isLast && isFile
          ? `${base}/blob/${branch}/${segmentPath}`
          : `${base}/tree/${branch}/${segmentPath}`;

        return (
          <span key={segmentPath} className="flex items-center gap-1">
            <span className="text-text-muted text-xs">/</span>
            {isLast ? (
              <span className="text-text-primary font-medium">{segment}</span>
            ) : (
              <Link
                href={href}
                className="text-accent-gold hover:text-accent transition-colors"
              >
                {segment}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
