Set WshShell = CreateObject("WScript.Shell")
strPath = Replace(WScript.ScriptFullName, WScript.ScriptName, "")
WshShell.Run """" & strPath & "VidLoader-PC-Launcher.bat""", 0, False
