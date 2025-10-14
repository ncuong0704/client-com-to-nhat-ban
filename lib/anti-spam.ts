/**
 * Anti-Spam Utilities
 * 
 * Multiple layers of protection against spam bots:
 * 1. Honeypot fields
 * 2. Time-based checks
 * 3. Pattern detection
 * 4. Disposable email detection
 */

/**
 * Check if honeypot field was filled (indicates bot)
 * 
 * @param honeypotValue - Value from honeypot field
 * @returns true if honeypot was triggered (is a bot)
 */
export function isHoneypotTriggered(honeypotValue: string | null | undefined): boolean {
  // If honeypot field has any value, it's a bot
  return honeypotValue !== null && honeypotValue !== undefined && honeypotValue !== '';
}

/**
 * Check if submission timing seems human-like
 * Bots typically submit forms in < 3 seconds
 * 
 * @param formOpenTime - Timestamp when form was opened
 * @param minSeconds - Minimum required seconds (default: 3)
 * @param maxSeconds - Maximum allowed seconds (default: 3600 = 1 hour)
 * @returns { isHuman: boolean, reason?: string }
 */
export function checkSubmissionTiming(
  formOpenTime: number,
  minSeconds: number = 3,
  maxSeconds: number = 3600
): { isHuman: boolean; reason?: string } {
  const now = Date.now();
  const timeDiff = now - formOpenTime;
  const seconds = timeDiff / 1000;

  // Too fast - likely a bot
  if (seconds < minSeconds) {
    return {
      isHuman: false,
      reason: `Submission too fast: ${seconds.toFixed(1)}s (min: ${minSeconds}s)`
    };
  }

  // Too slow - suspicious (form abandoned then resubmitted?)
  if (seconds > maxSeconds) {
    return {
      isHuman: false,
      reason: `Submission too slow: ${seconds.toFixed(0)}s (max: ${maxSeconds}s)`
    };
  }

  return { isHuman: true };
}

/**
 * Detect common spam patterns in text
 * 
 * @param text - Text to check
 * @returns { isSpam: boolean, patterns: string[] }
 */
export function detectSpamPatterns(text: string): { isSpam: boolean; patterns: string[] } {
  const spamPatterns = [
    // Common spam keywords
    /\b(viagra|cialis|casino|poker|lottery|winner|prize|bitcoin|crypto)\b/i,
    
    // Too many links
    /(https?:\/\/[^\s]+.*){3,}/gi,
    
    // Excessive caps
    /([A-Z]{5,}.*){3,}/,
    
    // Repeated characters
    /(.)\1{10,}/,
    
    // Phone numbers repeated multiple times
    /(\+?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}.*){3,}/,
    
    // Email addresses repeated multiple times
    /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}.*){3,}/gi,
    
    // Common spam phrases
    /(make money fast|click here now|limited time offer|act now|free money)/i,
    
    // Excessive special characters
    /[!@#$%^&*]{10,}/,
  ];

  const detectedPatterns: string[] = [];

  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      detectedPatterns.push(pattern.toString());
    }
  }

  return {
    isSpam: detectedPatterns.length > 0,
    patterns: detectedPatterns
  };
}

/**
 * List of disposable email domains
 * Add more as needed
 */
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email',
  'tempmail.com',
  'fakeinbox.com',
  'trashmail.com',
  'yopmail.com',
  'maildrop.cc',
  'getnada.com',
  'mailnesia.com',
  'sharklasers.com',
];

/**
 * Check if email is from a disposable email provider
 * 
 * @param email - Email address to check
 * @returns true if email is disposable
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;

  return DISPOSABLE_EMAIL_DOMAINS.some(disposableDomain => 
    domain === disposableDomain || domain.endsWith(`.${disposableDomain}`)
  );
}

/**
 * Check if email domain has valid MX records
 * Note: This is a basic check, for production use a service like:
 * - Kickbox.io
 * - ZeroBounce
 * - EmailListVerify
 * 
 * @param email - Email address to check
 * @returns true if domain seems valid (basic check)
 */
export function hasValidEmailDomain(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;

  // Basic checks
  const invalidDomains = [
    'example.com',
    'test.com',
    'localhost',
    'invalid.com',
    'fake.com',
  ];

  if (invalidDomains.includes(domain)) {
    return false;
  }

  // Must have TLD
  const tldPattern = /\.[a-z]{2,}$/i;
  if (!tldPattern.test(domain)) {
    return false;
  }

  return true;
}

/**
 * Calculate spam score for submission
 * 
 * @param data - Submission data
 * @returns { score: number, reasons: string[] } (0-100, higher = more likely spam)
 */
export function calculateSpamScore(data: {
  honeypot?: string;
  formOpenTime?: number;
  email?: string;
  message?: string;
  name?: string;
}): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Check honeypot (50 points)
  if (data.honeypot && isHoneypotTriggered(data.honeypot)) {
    score += 50;
    reasons.push('Honeypot field was filled');
  }

  // Check timing (30 points)
  if (data.formOpenTime) {
    const timingCheck = checkSubmissionTiming(data.formOpenTime);
    if (!timingCheck.isHuman) {
      score += 30;
      reasons.push(timingCheck.reason || 'Suspicious timing');
    }
  }

  // Check disposable email (20 points)
  if (data.email && isDisposableEmail(data.email)) {
    score += 20;
    reasons.push('Disposable email address');
  }

  // Check email domain (10 points)
  if (data.email && !hasValidEmailDomain(data.email)) {
    score += 10;
    reasons.push('Invalid email domain');
  }

  // Check message for spam patterns (30 points)
  if (data.message) {
    const spamCheck = detectSpamPatterns(data.message);
    if (spamCheck.isSpam) {
      score += 30;
      reasons.push('Spam patterns detected in message');
    }
  }

  // Check name for spam patterns (10 points)
  if (data.name) {
    const spamCheck = detectSpamPatterns(data.name);
    if (spamCheck.isSpam) {
      score += 10;
      reasons.push('Spam patterns detected in name');
    }
  }

  // Check for very short message (5 points)
  if (data.message && data.message.trim().length < 10) {
    score += 5;
    reasons.push('Message too short');
  }

  return { score, reasons };
}

/**
 * Determine if submission should be blocked based on spam score
 * 
 * @param score - Spam score from calculateSpamScore
 * @param threshold - Score threshold (default: 50)
 * @returns true if submission should be blocked
 */
export function shouldBlockSubmission(score: number, threshold: number = 50): boolean {
  return score >= threshold;
}

/**
 * Get honeypot field names
 * Use random names to make it harder for bots to detect
 * 
 * @returns Object with field name and styles
 */
export function getHoneypotFieldConfig(): {
  name: string;
  className: string;
  style: React.CSSProperties;
  tabIndex: number;
  autoComplete: string;
} {
  // Common names bots might fill
  const fieldNames = ['website', 'url', 'homepage', 'phone2', 'fax'];
  const randomName = fieldNames[Math.floor(Math.random() * fieldNames.length)];

  return {
    name: randomName,
    className: 'absolute -left-[9999px]',
    style: {
      position: 'absolute',
      left: '-9999px',
      width: '1px',
      height: '1px',
      opacity: 0,
      pointerEvents: 'none',
    },
    tabIndex: -1,
    autoComplete: 'off',
  };
}

