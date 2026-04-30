import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 md:pt-32 md:pb-40">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
            A reading companion
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight">
            A quiet place
            <br />
            for your <span className="italic font-light">books.</span>
          </h1>
          <p className="mt-8 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Omni Library is a minimalist shelf for the reader who wants less
            noise. Discover, save, and journal — nothing more.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/catalog">
              <Button size="lg" className="rounded-full px-7">Browse the catalog</Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="rounded-full px-7">
                Create your shelf
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Three-up minimal feature row */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
          {[
            {
              n: "01",
              title: "Discover",
              body: "A clean catalog of titles, free of recommendations and clutter.",
            },
            {
              n: "02",
              title: "Collect",
              body: "Save books to your shelf and track what you're reading.",
            },
            {
              n: "03",
              title: "Reflect",
              body: "Keep a private journal of quotes and thoughts as you read.",
            },
          ].map((f) => (
            <div key={f.n} className="bg-background p-8 md:p-10">
              <div className="text-xs tracking-[0.2em] text-muted-foreground mb-6">
                {f.n}
              </div>
              <h3 className="font-display text-2xl mb-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
