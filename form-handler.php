<?php
/**
 * daveyduarte.com — contact form handler
 * Delivers to info@thexdigital.com
 *
 * Responds with JSON when the form posts via fetch (js/main.js),
 * and with a plain redirect when JavaScript is off.
 */

declare(strict_types=1);

/* ------------------------------------------------------------------
   SETTINGS
   ------------------------------------------------------------------ */
$TO            = 'info@thexdigital.com';
$SUBJECT       = 'New enquiry from daveyduarte.com';
$FROM_DOMAIN   = 'daveyduarte.com';        // must match the sending server
$FROM_ADDRESS  = 'no-reply@daveyduarte.com'; // envelope sender; keep on your own domain
$THANKS_URL    = '/?sent=1#contact';
$ERROR_URL     = '/?error=1#contact';

/* ------------------------------------------------------------------ */

$isAjax = isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json');

function respond(bool $ok, string $message, int $code = 200): void
{
    global $isAjax, $THANKS_URL, $ERROR_URL;

    if ($isAjax) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'error' => $ok ? null : $message]);
    } else {
        header('Location: ' . ($ok ? $THANKS_URL : $ERROR_URL), true, 303);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

/* honeypot — silently accept so bots do not learn anything */
if (!empty($_POST['website'] ?? '')) {
    respond(true, '');
}

/* ---- collect + clean ---- */
function clean(string $key, int $max = 500): string
{
    $v = trim((string) ($_POST[$key] ?? ''));
    $v = str_replace(["\r", "\n", "\0"], ' ', $v);  // header-injection guard
    return mb_substr($v, 0, $max);
}

$name    = clean('name', 120);
$email   = clean('email', 180);
$phone   = clean('phone', 60);
$company = clean('company', 160);
$project = clean('project', 120);

$message = trim((string) ($_POST['message'] ?? ''));
$message = str_replace("\0", '', $message);
$message = mb_substr($message, 0, 6000);

/* ---- validate ---- */
$errors = [];
if ($name === '')                                        $errors[] = 'name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))          $errors[] = 'email';
if (mb_strlen($message) < 10)                            $errors[] = 'message';

if ($errors) {
    respond(false, 'Please check the highlighted fields and try again.', 422);
}

/* ---- compose ---- */
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$when = gmdate('Y-m-d H:i') . ' UTC';

$body = "New enquiry from daveyduarte.com\n"
      . str_repeat('-', 46) . "\n\n"
      . "Name:     {$name}\n"
      . "Email:    {$email}\n"
      . "Phone:    " . ($phone   !== '' ? $phone   : '—') . "\n"
      . "Company:  " . ($company !== '' ? $company : '—') . "\n"
      . "Needs:    " . ($project !== '' ? $project : '—') . "\n\n"
      . "Message\n"
      . str_repeat('-', 46) . "\n"
      . $message . "\n\n"
      . str_repeat('-', 46) . "\n"
      . "Sent {$when} · IP {$ip}\n";

$headers = [
    'From: Davey Duarte Website <' . $FROM_ADDRESS . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
];

$subject = $SUBJECT . ' — ' . $name;

$sent = @mail(
    $TO,
    '=?UTF-8?B?' . base64_encode($subject) . '?=',
    $body,
    implode("\r\n", $headers),
    '-f' . $FROM_ADDRESS
);

if (!$sent) {
    respond(false, 'The message could not be sent. Please email info@thexdigital.com directly.', 500);
}

respond(true, '');
