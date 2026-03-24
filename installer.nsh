!macro preInit
  ; Check if running on client machine
  SetRegView 64
  ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{bda972f3-8a5a-4e8f-8c7d-3b3f2b5c5e5e}" "DisplayVersion"
  ${If} $0 == ""
    ; No need to install VC++ as we're bundling it
    ; But we'll show a message
    MessageBox MB_OK "Note: This app bundles all required dependencies. No additional installation needed."
  ${EndIf}
!macroend