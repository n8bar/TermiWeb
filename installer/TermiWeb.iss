; TermiWeb Windows installer.
;
; Built by scripts/assemble-release.mjs from the same staged layout that becomes
; the portable zip, so the two artifacts cannot drift apart. The assembly script
; passes AppVersion, StageDir, and OutputDir in through /D defines.
;
; Layout: binaries under Program Files, config and state under ProgramData. The
; installer writes install-layout.json beside the binaries so the operational
; scripts resolve .env and the data directory from ProgramData. Every mechanism
; (auto-start task, firewall rule, stop) lives in those scripts; the installer
; only calls them.

#ifndef AppVersion
  #error AppVersion must be defined, for example /DAppVersion=0.1.2
#endif
#ifndef StageDir
  #error StageDir must be defined and point at the staged release layout
#endif
#ifndef OutputDir
  #define OutputDir "."
#endif
#ifndef OutputBaseFilename
  #define OutputBaseFilename "TermiWeb-" + AppVersion + "-windows-x64-setup"
#endif

#define AppName "TermiWeb"
#define AppPublisher "n8bar"
#define AppURL "https://termiweb.com"
#define ConfigDirName "TermiWeb"
#define PowerShellExe "{sys}\WindowsPowerShell\v1.0\powershell.exe"

[Setup]
AppId={{8E6C1B1E-7C3B-4A1F-9E3E-5D2B9C0F1A77}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL=https://github.com/n8bar/TermiWeb/issues
AppUpdatesURL={#AppURL}
DefaultDirName={autopf}\{#AppName}
DisableDirPage=yes
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir={#OutputDir}
OutputBaseFilename={#OutputBaseFilename}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
LicenseFile={#StageDir}\LICENSE
InfoBeforeFile={#StageDir}\DISCLAIMER.md
UninstallDisplayName={#AppName}
CloseApplications=no
SetupLogging=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "{#StageDir}\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs ignoreversion; Excludes: ".env,install-layout.json,.termiweb\*"

[Dirs]
Name: "{commonappdata}\{#ConfigDirName}"

; Upgrades start from clean build output and dependencies so nothing stale
; from an older version lingers beside the new files.
[InstallDelete]
Type: filesandordirs; Name: "{app}\dist"
Type: filesandordirs; Name: "{app}\node_modules"

[Icons]
Name: "{group}\Open TermiWeb"; Filename: "{code:GetLocalUrl}"; Comment: "Open TermiWeb in your browser"
Name: "{group}\Start TermiWeb"; Filename: "{app}\Start TermiWeb.cmd"; WorkingDir: "{app}"; Flags: runminimized; Comment: "Start TermiWeb hidden"
Name: "{group}\Restart TermiWeb"; Filename: "{app}\Restart TermiWeb.cmd"; WorkingDir: "{app}"; Flags: runminimized; Comment: "Restart TermiWeb"
Name: "{group}\Stop TermiWeb"; Filename: "{app}\Stop TermiWeb.cmd"; WorkingDir: "{app}"; Flags: runminimized; Comment: "Stop TermiWeb"
Name: "{group}\Enable TermiWeb Auto Start"; Filename: "{app}\Enable TermiWeb Auto Start.cmd"; WorkingDir: "{app}"; Flags: runminimized; Comment: "Start TermiWeb before sign-in"
Name: "{group}\Disable TermiWeb Auto Start"; Filename: "{app}\Disable TermiWeb Auto Start.cmd"; WorkingDir: "{app}"; Flags: runminimized; Comment: "Stop starting TermiWeb before sign-in"

[Run]
; runascurrentuser keeps the start elevated inside Setup's context; postinstall
; entries otherwise run de-elevated as the original user, which would make the
; start script raise a second UAC prompt.
Filename: "{#PowerShellExe}"; Parameters: "-NoLogo -NoProfile -ExecutionPolicy Bypass -File ""{app}\scripts\start-hidden.ps1"" -Restart -WaitForPort"; WorkingDir: "{app}"; Flags: postinstall runhidden runascurrentuser skipifsilent; Description: "Start TermiWeb now"
Filename: "{code:GetLocalUrl}"; Flags: postinstall shellexec nowait skipifsilent; Description: "Open TermiWeb in your browser"

[UninstallRun]
Filename: "{#PowerShellExe}"; Parameters: "-NoLogo -NoProfile -ExecutionPolicy Bypass -File ""{app}\scripts\stop-hidden.ps1"""; WorkingDir: "{app}"; Flags: runhidden waituntilterminated; RunOnceId: "StopTermiWeb"
Filename: "{#PowerShellExe}"; Parameters: "-NoLogo -NoProfile -ExecutionPolicy Bypass -File ""{app}\scripts\disable-auto-start.ps1"""; WorkingDir: "{app}"; Flags: runhidden waituntilterminated; RunOnceId: "DisableTermiWebAutoStart"
Filename: "{#PowerShellExe}"; Parameters: "-NoLogo -NoProfile -ExecutionPolicy Bypass -File ""{app}\scripts\set-firewall-rule.ps1"" -Remove"; WorkingDir: "{app}"; Flags: runhidden waituntilterminated; RunOnceId: "RemoveTermiWebFirewallRule"

[UninstallDelete]
Type: files; Name: "{app}\install-layout.json"
Type: filesandordirs; Name: "{app}\.termiweb"
Type: dirifempty; Name: "{app}"

[Code]
var
  PasswordPage: TInputQueryWizardPage;
  AutoStartPage: TInputOptionWizardPage;
  RemoveConfigOnUninstall: Boolean;

function ConfigRoot: String;
begin
  Result := ExpandConstant('{commonappdata}\{#ConfigDirName}');
end;

function EnvPath: String;
begin
  Result := ConfigRoot + '\.env';
end;

{ Reads KEY=value from the ProgramData .env, ignoring comments. }
function ReadEnvValue(const Key: String; var Value: String): Boolean;
var
  Lines: TArrayOfString;
  I: Integer;
  Line: String;
begin
  Result := False;
  Value := '';
  if not LoadStringsFromFile(EnvPath, Lines) then
    Exit;
  for I := 0 to GetArrayLength(Lines) - 1 do
  begin
    Line := Trim(Lines[I]);
    if (Length(Line) > 0) and (Line[1] <> '#') and (Pos(Key + '=', Line) = 1) then
    begin
      Value := Trim(Copy(Line, Length(Key) + 2, MaxInt));
      Result := True;
      Exit;
    end;
  end;
end;

function HasConfiguredPassword: Boolean;
var
  Value: String;
begin
  Result := ReadEnvValue('TERMIWEB_PASSWORD', Value) and (Value <> '') and (Value <> 'change-me-first');
end;

function ConfiguredPort: String;
var
  Value: String;
begin
  if ReadEnvValue('TERMIWEB_PORT', Value) and (Value <> '') then
    Result := Value
  else
    Result := '22443';
end;

function GetLocalUrl(Param: String): String;
begin
  Result := 'http://127.0.0.1:' + ConfiguredPort + '/';
end;

{ Command-line overrides for unattended installs: /PASSWORD=... /AUTOSTART=1 }
function PasswordParameter: String;
begin
  Result := ExpandConstant('{param:PASSWORD|}');
end;

function AutoStartParameter: Boolean;
begin
  Result := ExpandConstant('{param:AUTOSTART|0}') = '1';
end;

procedure InitializeWizard;
begin
  PasswordPage := CreateInputQueryPage(wpSelectDir,
    'TermiWeb password',
    'Choose the password for signing in to TermiWeb.',
    'Every browser that connects to this TermiWeb enters this password. It is stored in the TermiWeb config under ProgramData, not in Windows.');
  PasswordPage.Add('Password:', True);
  PasswordPage.Values[0] := PasswordParameter;

  AutoStartPage := CreateInputOptionPage(PasswordPage.ID,
    'Start before sign-in',
    'Should TermiWeb start with Windows?',
    'Auto-start registers a Windows startup task that runs as the built-in SYSTEM account, so no Windows account password is ever requested. Shells opened on an auto-started TermiWeb run as SYSTEM until you stop it and start it manually. An existing TermiWeb auto-start task is kept and updated either way.',
    False, False);
  AutoStartPage.Add('Start TermiWeb automatically before anyone signs in');
  AutoStartPage.Values[0] := AutoStartParameter;
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := False;
  if PageID = PasswordPage.ID then
    Result := HasConfiguredPassword or (PasswordParameter <> '');
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  if (CurPageID = PasswordPage.ID) and (Trim(PasswordPage.Values[0]) = '') then
  begin
    MsgBox('Enter a password. TermiWeb refuses connections without one.', mbError, MB_OK);
    Result := False;
  end;
end;

function RunScript(const ScriptName, Arguments: String; var ResultCode: Integer): Boolean;
begin
  Result := Exec(ExpandConstant('{#PowerShellExe}'),
    '-NoLogo -NoProfile -ExecutionPolicy Bypass -File "' + ExpandConstant('{app}\scripts\') + ScriptName + '" ' + Arguments,
    ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, ResultCode);
  if Result then
    Log(Format('%s %s exited with code %d', [ScriptName, Arguments, ResultCode]))
  else
    Log(Format('%s %s could not be started (error %d)', [ScriptName, Arguments, ResultCode]));
end;

{ An upgrade replaces node.exe and the server files, so a running server from
  the previous install has to stop first. }
function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  ResultCode: Integer;
begin
  Result := '';
  if FileExists(ExpandConstant('{app}\scripts\stop-hidden.ps1')) then
    RunScript('stop-hidden.ps1', '', ResultCode);
end;

function JsonEscape(const S: String): String;
begin
  Result := S;
  StringChangeEx(Result, '\', '\\', True);
  StringChangeEx(Result, '"', '\"', True);
end;

procedure WriteLayoutFile;
begin
  if not SaveStringToFile(ExpandConstant('{app}\install-layout.json'),
    '{"configRoot": "' + JsonEscape(ConfigRoot) + '"}' + #13#10, False) then
    RaiseException('Could not write the install layout file under ' + ExpandConstant('{app}') + '.');
end;

function EnvQuoted(const Value: String): String;
begin
  if (Pos(' ', Value) > 0) or (Pos('#', Value) > 0) then
    Result := '"' + Value + '"'
  else
    Result := Value;
end;

{ Writes the ProgramData .env. A fresh install starts from the packaged template;
  an existing .env keeps every setting and only gains the password (when it was
  missing) and the start directory (when it was blank). }
procedure WriteEnv;
var
  Lines: TArrayOfString;
  I: Integer;
  Line: String;
  Password: String;
  StartDirectory: String;
  SawPassword: Boolean;
  SawStartDirectory: Boolean;
begin
  Password := Trim(PasswordPage.Values[0]);
  StartDirectory := GetEnv('USERPROFILE');
  if not FileExists(EnvPath) then
  begin
    if not LoadStringsFromFile(ExpandConstant('{app}\.env.example'), Lines) then
      RaiseException('The packaged .env.example is missing.');
  end
  else if not LoadStringsFromFile(EnvPath, Lines) then
    RaiseException('Could not read ' + EnvPath + '.');

  SawPassword := False;
  SawStartDirectory := False;
  for I := 0 to GetArrayLength(Lines) - 1 do
  begin
    Line := Trim(Lines[I]);
    if Pos('TERMIWEB_PASSWORD=', Line) = 1 then
    begin
      SawPassword := True;
      if (Password <> '') and not HasConfiguredPassword then
        Lines[I] := 'TERMIWEB_PASSWORD=' + EnvQuoted(Password);
    end
    else if Pos('TERMIWEB_START_DIRECTORY=', Line) = 1 then
    begin
      SawStartDirectory := True;
      if (Trim(Copy(Line, Length('TERMIWEB_START_DIRECTORY=') + 1, MaxInt)) = '') and (StartDirectory <> '') then
        Lines[I] := 'TERMIWEB_START_DIRECTORY=' + StartDirectory;
    end;
  end;

  if (not SawPassword) and (Password <> '') then
  begin
    SetArrayLength(Lines, GetArrayLength(Lines) + 1);
    Lines[GetArrayLength(Lines) - 1] := 'TERMIWEB_PASSWORD=' + EnvQuoted(Password);
  end;
  if (not SawStartDirectory) and (StartDirectory <> '') then
  begin
    SetArrayLength(Lines, GetArrayLength(Lines) + 1);
    Lines[GetArrayLength(Lines) - 1] := 'TERMIWEB_START_DIRECTORY=' + StartDirectory;
  end;

  ForceDirectories(ConfigRoot);
  if not SaveStringsToFile(EnvPath, Lines, False) then
    RaiseException('Could not write ' + EnvPath + '.');
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssPostInstall then
  begin
    WriteLayoutFile;
    WriteEnv;
    RunScript('set-firewall-rule.ps1', '', ResultCode);
    if AutoStartPage.Values[0] then
      RunScript('enable-auto-start.ps1', '', ResultCode)
    else
      RunScript('enable-auto-start.ps1', '-RefreshExisting', ResultCode);
  end;
end;

function InitializeUninstall(): Boolean;
begin
  Result := True;
  RemoveConfigOnUninstall := MsgBox(
    'Also remove the TermiWeb config and workspace state under ' + ConfigRoot + '?' + #13#10#13#10 +
    'Choose No to keep your password, settings, and instance list for a later install.',
    mbConfirmation, MB_YESNO or MB_DEFBUTTON2) = IDYES;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if (CurUninstallStep = usPostUninstall) and RemoveConfigOnUninstall then
    DelTree(ConfigRoot, True, True, True);
end;
