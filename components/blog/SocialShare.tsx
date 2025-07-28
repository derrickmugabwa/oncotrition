'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export default function SocialShare({ url, title, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  const shareDescription = encodeURIComponent(description || '');

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      color: 'hover:bg-blue-600',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
      color: 'hover:bg-sky-500',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      color: 'hover:bg-blue-700',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const openShareDialog = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 text-gray-600">
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-medium">Share:</span>
      </div>

      <div className="flex items-center space-x-2">
        {socialLinks.map((social) => {
          const IconComponent = social.icon;
          return (
            <motion.button
              key={social.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openShareDialog(social.url)}
              className={`p-2 rounded-full bg-gray-100 text-gray-600 transition-all duration-300 ${social.color} hover:text-white`}
              title={`Share on ${social.name}`}
            >
              <IconComponent className="w-4 h-4" />
            </motion.button>
          );
        })}

        {/* Copy Link Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={copyToClipboard}
          className={`p-2 rounded-full transition-all duration-300 ${
            copied 
              ? 'bg-green-100 text-green-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <LinkIcon className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      {/* Copy Success Message */}
      {copied && (
        <motion.span
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="text-sm text-green-600 font-medium"
        >
          Link copied!
        </motion.span>
      )}
    </div>
  );
}
