import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1 pt-16">
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-rose-500/[0.08]" />
          
          <div className="container relative z-10 mx-auto px-4 py-24">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Badge */}
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm font-medium">
                  Built on Stacks Blockchain
                </span>
              </div>
              
              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="block">A Creator-First</span>
                <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
                  NFT Marketplace
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Create, collect, and trade unique digital assets with on-chain royalties, traits, and metadata. Powered by Bitcoin security.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="min-w-[200px]">
                  <Link href="/explore">Explore NFTs</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="min-w-[200px]">
                  <Link href="/create">Create Collection</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 border-t border-white/[0.08]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                  4
                </div>
                <div className="text-sm text-white/60 mt-2">Active Collections</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent">
                  10
                </div>
                <div className="text-sm text-white/60 mt-2">NFTs Minted</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
                  10
                </div>
                <div className="text-sm text-white/60 mt-2">Listed for Sale</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-cyan-400 bg-clip-text text-transparent">
                  Live
                </div>
                <div className="text-sm text-white/60 mt-2">On Mainnet</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
              Why Choose Haven Collective?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-xl font-semibold mb-2">Creator Royalties</h3>
                <p className="text-white/60">
                  Built-in royalty distribution ensures creators earn from every secondary sale, forever.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">On-Chain Traits</h3>
                <p className="text-white/60">
                  Store traits and metadata directly on-chain for true rarity and transparency.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-colors">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-2">Bitcoin Security</h3>
                <p className="text-white/60">
                  Secured by Bitcoin's hash power through Stacks' Proof of Transfer consensus.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
