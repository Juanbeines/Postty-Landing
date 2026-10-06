/* English translation of PrivacyContent.tsx. The Spanish text is the
   governing version (the page says so above this content) — when the
   Spanish policy changes, update this file in the same commit. */
export default function PrivacyContentEn() {
  return (
    <>
      <p className="text-xs text-[#0D1522]/50 mb-4">Last updated: July 21, 2026</p>

      <h2>Data controller</h2>
      <p>Postty is a registered trademark owned by Darío Soria, domiciled at Manuel Basavilbaso 4103, Olivos (ZIP 1636), Vicente López, Province of Buenos Aires, Argentina. The controller of your personal data is Darío Soria (Postty), whom you can contact with any question at the email address below.</p>
      <p>Contact email: <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a></p>

      <h2>Data we collect</h2>
      <ul>
        <li><strong>Authentication:</strong> Firebase UID, email, name, photo (via Google Sign-In)</li>
        <li><strong>Store:</strong> URL, products, prices, images (automated scraping)</li>
        <li><strong>Brand:</strong> Colors, typefaces, tone, logo (analysis of your website)</li>
        <li><strong>Campaigns:</strong> Drafts, conversations with the AI, generated assets</li>
        <li><strong>Payments:</strong> Subscription ID, plan, status (MercadoPago)</li>
        <li><strong>Usage:</strong> Counters, feedback, ratings</li>
        <li><strong>WhatsApp contact (optional):</strong> if you message us on WhatsApp, we receive your phone number and profile name in our WhatsApp Business inbox. We do not export this data to any CRM or keep it beyond the conversation.</li>
        <li><strong>Connected ad accounts (optional):</strong> when you connect your Meta Ads or Google Ads account, we store the access tokens (encrypted with AES-256), the IDs of the authorized ad accounts, and metadata about the campaigns you manage from Postty (structure, budget, performance metrics). This data is processed only for operations you start from the platform.</li>
        <li><strong>Connected Instagram and Meta profiles (optional):</strong> if you connect your Instagram and Meta accounts to personalize content and ads, we access the profile information needed for that purpose (account data and posts). If you prefer not to connect them, Postty generates from your website URL, with a lower degree of personalization.</li>
      </ul>

      <h2>Purposes of processing</h2>
      <ul>
        <li>Providing the campaign generation service</li>
        <li>Managing your account and subscription</li>
        <li>Applying limits according to your plan</li>
        <li>Improving the service and fixing errors</li>
        <li>Communicating updates and support</li>
      </ul>

      <h2>Legal basis</h2>
      <ul>
        <li><strong>Performance of a contract:</strong> to provide you the service</li>
        <li><strong>Consent:</strong> when you sign up and accept the Terms and Conditions</li>
        <li><strong>Legitimate interest:</strong> to improve the service and prevent fraud</li>
      </ul>

      <h2>Third-party services</h2>
      <ul>
        <li><strong>Firebase (Google):</strong> User authentication</li>
        <li><strong>Gemini (Google):</strong> Conversational AI, multimodal analysis and script generation</li>
        <li><strong>Nano Banana (Google):</strong> Ad image generation</li>
        <li><strong>ElevenLabs:</strong> Voice generation for videos</li>
        <li><strong>MercadoPago:</strong> Payment and subscription processing</li>
        <li><strong>Meta (Facebook and Instagram):</strong> Publishing ad campaigns (optional, only if you connect your account)</li>
        <li><strong>Google Ads:</strong> Publishing ad campaigns (optional, only if you connect your account)</li>
        <li><strong>Amazon Web Services (AWS):</strong> Hosting and infrastructure for the service</li>
        <li><strong>Google Analytics (Google):</strong> Website usage analytics (cookies)</li>
        <li><strong>Meta Pixel (Meta):</strong> Ad conversion measurement (cookies)</li>
        <li><strong>WhatsApp Business (Meta):</strong> Contact and support channel (optional, only if you message us)</li>
      </ul>

      <h2>Google Ads API integration</h2>
      <p>When you connect your Google Ads account to Postty through OAuth 2.0, we access only the data needed to run ad campaigns on your behalf. The data we access, write and store is:</p>
      <ul>
        <li><strong>Data we access (read):</strong> information about the Google Ads accounts you authorize (customer identifiers, currency, time zone), the structure of existing campaigns (names, status, budget, high-level targeting), performance metrics (impressions, clicks, conversions, cost, click-through rate), and creative assets previously uploaded to your account.</li>
        <li><strong>Data we write:</strong> we create ad campaigns, upload as creative assets the AI-generated images and videos you explicitly approve in the Postty interface, create ads within those campaigns, and pause or resume campaigns when you tell us to.</li>
        <li><strong>Data we store:</strong> the OAuth tokens (encrypted with AES-256 before being written to the database), the IDs of the authorized accounts, and a copy of the metadata of the campaigns you created from Postty so we can show you your history and metrics in our interface.</li>
      </ul>
      <p><strong>Sole purpose:</strong> data accessed through the Google Ads API is used only to carry out the actions you authorize from the Postty interface. We do not read data from other accounts, we do not combine data between different users, and we do not share or sell this information to third parties.</p>
      <p><strong>Revoking access:</strong> you can revoke the authorization at any time from (a) your account settings in Postty, or (b) directly from your Google account at <a href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</a>. Revocation takes effect immediately: we can no longer call the API on your behalf and the stored tokens are invalidated.</p>
      <p>Postty&apos;s use of information received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>

      <h2>Cookies and tracking technologies</h2>
      <p>Our website uses cookies and similar technologies for analytics and ad measurement:</p>
      <ul>
        <li><strong>Google Analytics:</strong> measures site usage (pages visited, traffic source, device) through cookies.</li>
        <li><strong>Meta Pixel:</strong> measures conversions from our ad campaigns. It may store a click identifier (fbclid) in your browser for up to 90 days.</li>
      </ul>
      <p>You can block or delete cookies from your browser settings; if you do, some measurement features will stop being available. These tools do not affect how the application works or content generation.</p>

      <h2>Storage and security</h2>
      <ul>
        <li>PostgreSQL database with encryption in transit</li>
        <li>Role-based access restrictions</li>
        <li>We do not store card data (MercadoPago handles it)</li>
      </ul>

      <h2>Retention</h2>
      <ul>
        <li>For as long as your account is active</li>
        <li>30 days after you request deletion (for backup)</li>
        <li>Anonymized data may be kept indefinitely for aggregate analysis</li>
      </ul>

      <h2>International transfer</h2>
      <p>Your data may be processed on servers of our providers located in the United States, the European Union and other jurisdictions where Google (Firebase, Gemini, Nano Banana, Google Ads), Meta (Facebook, Instagram), ElevenLabs, MercadoPago and AWS operate. All of these providers comply with recognized data-protection standards, and we have the appropriate legal bases for international transfer under Argentina&apos;s Law 25,326.</p>

      <h2>Your rights (ARCO)</h2>
      <p>You have the right to access, rectify, delete and object to the processing of your data.</p>

      <h3>Access</h3>
      <p>You can ask which personal data we hold about you.</p>

      <h3>Rectification</h3>
      <p>You can ask us to correct inaccurate or incomplete data.</p>

      <h3>Deletion (Cancellation)</h3>
      <p>You can ask us to delete your personal data. This involves:</p>
      <ul>
        <li>Deleting your account</li>
        <li>Deleting campaigns, drafts and generated assets</li>
        <li>Cancelling any active subscription (with no refund for the current period)</li>
      </ul>
      <p>Exceptions: We may retain data where there is a legal obligation or for the defense of claims.</p>

      <h3>Objection</h3>
      <p>You can object to the processing of your data for specific purposes (e.g. marketing communications).</p>

      <h3>How to exercise your rights</h3>
      <ol>
        <li>Send an email to <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a> with the subject &quot;Solicitud ARCO&quot; (ARCO request)</li>
        <li>Include: your name, your account email, and which right you want to exercise</li>
        <li>We will reply within a maximum of 10 business days</li>
        <li>We may ask you to verify your identity</li>
      </ol>

      <h2>Changes</h2>
      <p>We will notify changes by email or on the platform. Continued use implies acceptance.</p>

      <h2>Contact</h2>
      <p>Email: <a href="mailto:soporte@posttyai.com">soporte@posttyai.com</a></p>
      <p>Website: <a href="https://posttyai.com">https://posttyai.com</a></p>

      <p className="mt-6 text-xs text-[#0D1522]/40">Supervisory authority: If you believe your rights were not respected, you can file a complaint with Argentina&apos;s Agency for Access to Public Information (AAIP) — <a href="https://www.argentina.gob.ar/aaip">https://www.argentina.gob.ar/aaip</a></p>
    </>
  );
}
