import { useState } from 'react';
import { YouTubeStreamInfo } from '../../types';
import { Radio, ExternalLink, Play, Eye, Calendar, Sparkles, MessageSquare, Video } from 'lucide-react';

interface Props {
  streams: YouTubeStreamInfo[];
}

export function MediaStreamView({ streams }: Props) {
  const [selectedStream, setSelectedStream] = useState<YouTubeStreamInfo>(streams[0] || null);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white font-heading flex items-center gap-2">
            <Radio className="w-7 h-7 text-red-500 animate-pulse" /> TMT Official YT Broadcast Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Live Free Fire tournament casts, caster commentary, custom lobby replays, and tournament highlights.
          </p>
        </div>

        <a
          href="https://youtube.com/@tmtofficialyt"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow cursor-pointer active:scale-95 transition self-start sm:self-center"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Subscribe Channel</span>
        </a>
      </div>

      {/* Main Video Stage & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Player */}
        <div className="lg:col-span-2 space-y-4">
          {selectedStream && (
            <div className="bg-[#0f1422] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="aspect-video w-full bg-black relative">
                <iframe
                  src={selectedStream.embedUrl}
                  title={selectedStream.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedStream.status === 'LIVE' ? (
                    <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-xs font-extrabold animate-pulse">
                      LIVE BROADCAST
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-bold">
                      REPLAY ARCHIVE
                    </span>
                  )}
                  <span className="text-xs text-amber-400 font-mono font-semibold">
                    Casters: {selectedStream.casterNames.join(' & ')}
                  </span>
                </div>

                <h2 className="text-lg md:text-xl font-bold text-white font-heading">
                  {selectedStream.title}
                </h2>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-red-400" />
                      {selectedStream.viewerCount?.toLocaleString()} Viewers
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selectedStream.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <a
                    href={`https://youtube.com/watch?v=${selectedStream.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Open on YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Playlist & Official Links */}
        <div className="space-y-4">
          <div className="bg-[#0f1422] rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-400" /> Stream Broadcasts ({streams.length})
            </h3>

            <div className="space-y-2.5">
              {streams.map(str => {
                const isCurrent = selectedStream?.videoId === str.videoId;

                return (
                  <div
                    key={str.videoId}
                    onClick={() => setSelectedStream(str)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={str.thumbnailUrl}
                      alt={str.title}
                      referrerPolicy="no-referrer"
                      className="w-24 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white line-clamp-2">{str.title}</p>
                      <p className="text-[10px] text-amber-400 font-mono mt-1">
                        {str.status === 'LIVE' ? '🔴 Live Now' : 'Replay'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discord Caster Voice Hub */}
          <div className="bg-gradient-to-br from-[#5865F2]/20 via-[#0f1422] to-[#0f1422] rounded-2xl border border-[#5865F2]/40 p-5 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <MessageSquare className="w-4 h-4 text-[#5865F2]" />
              <span>TMT Official Discord Voice</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Captains and athletes must join assigned Discord voice stages for live room coordinate callouts, verification pings, and caster interviews.
            </p>
            <a
              href="https://discord.gg/tmtesports"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold rounded-xl transition"
            >
              <span>Join Discord Voice</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
