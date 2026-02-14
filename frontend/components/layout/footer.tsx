import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">
              <span className="bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent">
                Haven
              </span>{' '}
              Collective
            </h3>
            <p className="text-sm text-white/60">
              A creator-first NFT marketplace built on Stacks blockchain.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://github.com/Mosas2000/Haven-Collective"
                target="_blank"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Marketplace */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Marketplace</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/explore"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Create */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Create</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/create"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Mint NFT
                </Link>
              </li>
              <li>
                <Link
                  href="/create"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  New Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://github.com/Mosas2000/Haven-Collective"
                  target="_blank"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.stacks.co"
                  target="_blank"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  Stacks Blockchain
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.08]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">
              © 2026 Haven Collective. Built on Stacks.
            </p>
            <p className="text-sm text-white/40">
              Contract: SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
