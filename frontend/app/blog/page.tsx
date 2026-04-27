import React from "react";

export default function BlogPage() {
  const posts = [
    { title: "The Future of AI in Healthcare", date: "April 10, 2026", read: "5 min read" },
    { title: "How Blockchain Protects Medical Records", date: "April 02, 2026", read: "8 min read" },
    { title: "Top 10 Early Symptoms You Shouldn't Ignore", date: "March 28, 2026", read: "6 min read" },
    { title: "Navigating CuraWise: A Patient's Guide", date: "March 15, 2026", read: "4 min read" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 max-w-5xl mx-auto relative z-10">
      <div className="mb-16 border-b border-slate-200 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4">
          Latest <span className="text-accent">Insights</span>
        </h1>
        <p className="text-muted text-lg">
          Read up on the latest announcements, health tips, and tech news from CuraWise.
        </p>
      </div>

      <div className="grid gap-8">
        {posts.map((post, idx) => (
          <article key={idx} className="card-3d rounded-2xl bg-white/80 p-8 border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4 text-xs font-semibold text-muted mb-3 uppercase tracking-wider">
              <span>{post.date}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>{post.read}</span>
            </div>
            <h2 className="text-2xl font-bold text-ink group-hover:text-accent transition-colors mb-3">
              {post.title}
            </h2>
            <p className="text-slate-500 leading-relaxed mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...
            </p>
            <div className="text-accent font-bold text-sm">Read article &rarr;</div>
          </article>
        ))}
      </div>
    </div>
  );
}
