import { Search as SearchIcon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";

const Search = () => {
  return (
    <AppLayout>
      <div className="py-6 space-y-6">
        <h2 className="text-2xl font-display text-primary text-center">
          Search the Dumpster
        </h2>
        
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Find bad movies..."
            className="pl-10 bg-muted border-border focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="glass-dark rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Start typing to search through verified trash and purgatory picks.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Search;
