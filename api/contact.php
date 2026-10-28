<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function respond(int $status, string $message): void { http_response_code($status); echo json_encode(['ok' => $status === 200, 'message' => $message], JSON_UNESCAPED_UNICODE); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, 'Methode nicht erlaubt.');
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) respond(413, 'Die Nachricht ist zu groß.');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && !in_array($origin, ['https://nomoneynohoney.io', 'https://www.nomoneynohoney.io'], true)) respond(403, 'Anfrage nicht erlaubt.');
$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) respond(400, 'Ungültige Anfrage.');
function field(array $data, string $key, int $limit = 300): string {
  $value = $data[$key] ?? '';
  if (!is_string($value)) return '';
  return trim(substr(str_replace(["\r", "\0"], '', $value), 0, $limit));
}
$type = field($data, 'type', 20);
$name = field($data, 'name'); $email = field($data, 'email');
$message = field($data, 'message', 8000); $subject = field($data, 'subject');
if (!in_array($type, ['kontakt', 'angebot'], true) || $name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strpos($email, "\n") !== false || empty($data['privacy'])) respond(422, 'Bitte überprüfe die Pflichtfelder.');
if ($type === 'kontakt' && ($message === '' || $subject === '')) respond(422, 'Bitte überprüfe die Pflichtfelder.');
if (field($data, 'website_check') !== '') respond(400, 'Anfrage konnte nicht gesendet werden.');
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$limitFile = sys_get_temp_dir() . '/nmnh-form-' . hash('sha256', $ip);
$handle = @fopen($limitFile, 'c+');
if ($handle && flock($handle, LOCK_EX)) {
  $history = json_decode(stream_get_contents($handle), true) ?: [];
  $history = array_values(array_filter($history, fn($t) => is_int($t) && $t > time() - 600));
  if (count($history) >= 5) { flock($handle, LOCK_UN); fclose($handle); respond(429, 'Zu viele Anfragen. Bitte versuche es später erneut.'); }
  $history[] = time(); rewind($handle); ftruncate($handle, 0); fwrite($handle, json_encode($history)); fflush($handle); flock($handle, LOCK_UN); fclose($handle);
}
$services = $data['services'] ?? [];
if (!is_array($services)) $services = [];
$services = array_slice(array_map(fn($v) => is_string($v) ? substr(str_replace(["\r", "\n"], '', $v),0,100) : '', $services), 0, 10);
$lines = ["Neue " . ($type === 'angebot' ? 'Angebotsanfrage' : 'Kontaktanfrage') . ' von nomoneynohoney.io', '', 'Name: ' . $name, 'E-Mail: ' . $email, 'Telefon: ' . field($data, 'phone'), 'Website: ' . field($data, 'website')];
if ($type === 'kontakt') { $lines[] = 'Thema: ' . $subject; $lines[] = 'Sternzeichen: ' . field($data, 'zodiac'); }
else { $lines[] = 'Leistungen: ' . implode(', ', $services); $lines[] = 'Budget: ' . field($data, 'budget'); }
$lines[] = ''; $lines[] = 'Nachricht:'; $lines[] = $message !== '' ? $message : '(keine Angabe)';
$headers = ['From' => 'No Money No Honey <kontakt@nomoneynohoney.io>', 'Reply-To' => $email, 'Content-Type' => 'text/plain; charset=UTF-8', 'X-Mailer' => 'NMNH Website'];
$subjectLine = $type === 'angebot' ? 'Neue Angebotsanfrage' : 'Neue Kontaktanfrage';
$configPath = dirname(__DIR__, 2) . '/.nmnh-smtp-password.txt';
if (is_file($configPath)) {
  $smtpPassword = trim((string) @file_get_contents($configPath));
  if ($smtpPassword === '') respond(503, 'Der Versand ist gerade nicht möglich. Bitte schreibe direkt an kontakt@nomoneynohoney.io.');
  require __DIR__ . '/vendor/phpmailer/Exception.php';
  require __DIR__ . '/vendor/phpmailer/PHPMailer.php';
  require __DIR__ . '/vendor/phpmailer/SMTP.php';
  try {
    $mailer = new \PHPMailer\PHPMailer\PHPMailer(true);
    $mailer->isSMTP();
    $mailer->Host = 'smtp.hostinger.com';
    $mailer->SMTPAuth = true;
    $mailer->Username = 'kontakt@nomoneynohoney.io';
    $mailer->Password = $smtpPassword;
    $mailer->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mailer->Port = 465;
    $mailer->Timeout = 15;
    $mailer->CharSet = 'UTF-8';
    $mailer->setFrom('kontakt@nomoneynohoney.io', 'No Money No Honey');
    $mailer->addAddress('kontakt@nomoneynohoney.io');
    $mailer->addReplyTo($email);
    $mailer->Subject = $subjectLine;
    $mailer->Body = implode("\n", $lines);
    $ok = $mailer->send();
  } catch (\Throwable $e) { $ok = false; }
} else {
  respond(503, 'Der Versand ist gerade nicht möglich. Bitte schreibe direkt an kontakt@nomoneynohoney.io.');
}
if (!$ok) respond(503, 'Der Versand ist gerade nicht möglich. Bitte schreibe direkt an kontakt@nomoneynohoney.io.');
respond(200, 'Deine Anfrage wurde übermittelt.');
