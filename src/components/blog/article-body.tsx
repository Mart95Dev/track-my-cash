"use client";

import { TableOfContents, useTableOfContents } from "./table-of-contents";
import { ShareButtons } from "./share-buttons";
import { ArticleReactions } from "./article-reactions";

type Props = {
  htmlContent: string;
  slug: string;
  url: string;
  title: string;
};

export function ArticleBody({ htmlContent, slug, url, title }: Props) {
  const tocItems = useTableOfContents(htmlContent);

  return (
    <>
      {/* Mobile TOC */}
      <div className="lg:hidden">
        <TableOfContents items={tocItems} />
      </div>

      <div className="flex gap-12">
        {/* Desktop TOC sidebar */}
        <div className="hidden lg:block">
          <TableOfContents items={tocItems} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div
            className="blog-prose max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Reactions */}
          <div className="mt-10">
            <ArticleReactions slug={slug} />
          </div>

          {/* Share */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm text-text-muted">Partager :</span>
            <ShareButtons url={url} title={title} />
          </div>
        </div>
      </div>
    </>
  );
}
