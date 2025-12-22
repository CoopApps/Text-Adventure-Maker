/// DAAD Game Launcher
/// Compiles .SCE files with DRC and launches compiled games

use std::path::{Path, PathBuf};
use std::process::{Command, Output, Stdio};
use std::io;

#[derive(Debug)]
pub enum LauncherError {
    DrcNotFound(String),
    CompilationFailed { stderr: String, exit_code: i32 },
    IoError(io::Error),
    InvalidPath(String),
}

impl std::fmt::Display for LauncherError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LauncherError::DrcNotFound(path) => write!(f, "DRC compiler not found at: {}", path),
            LauncherError::CompilationFailed { stderr, exit_code } => {
                write!(f, "DRC compilation failed (exit code {}): {}", exit_code, stderr)
            }
            LauncherError::IoError(e) => write!(f, "IO error: {}", e),
            LauncherError::InvalidPath(p) => write!(f, "Invalid path: {}", p),
        }
    }
}

impl From<io::Error> for LauncherError {
    fn from(err: io::Error) -> Self {
        LauncherError::IoError(err)
    }
}

pub type LauncherResult<T> = Result<T, LauncherError>;

/// DRC Compiler Target Platform
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DrcTarget {
    ZXSpectrum,
    AmstradCPC,
    Commodore64,
    CommodorePlus4,
    MSX,
    MSX2,
    PCW,
    PC,
    Amiga,
    AtariST,
    HTML,
}

impl DrcTarget {
    pub fn as_str(&self) -> &'static str {
        match self {
            DrcTarget::ZXSpectrum => "ZX",
            DrcTarget::AmstradCPC => "CPC",
            DrcTarget::Commodore64 => "C64",
            DrcTarget::CommodorePlus4 => "CP4",
            DrcTarget::MSX => "MSX",
            DrcTarget::MSX2 => "MSX2",
            DrcTarget::PCW => "PCW",
            DrcTarget::PC => "PC",
            DrcTarget::Amiga => "AMIGA",
            DrcTarget::AtariST => "ST",
            DrcTarget::HTML => "HTML",
        }
    }

    pub fn needs_subtarget(&self) -> bool {
        matches!(self, DrcTarget::ZXSpectrum | DrcTarget::MSX2 | DrcTarget::PC)
    }
}

/// DRC Subtarget (for ZX Spectrum, MSX2, PC)
#[derive(Debug, Clone)]
pub enum DrcSubtarget {
    // ZX Spectrum subtargets
    ZX48K,
    ZX128K,
    ZXPlus3,
    ZXESXDOS,
    ZXUno,
    ZXNext,

    // PC subtargets
    PCVGA256,
    PCVGA,
    PCEGA,
    PCCGA,
    PCTEXT,

    // MSX2 subtargets
    MSX2Mode(String), // e.g., "5_8", "10_8", etc.
}

impl DrcSubtarget {
    pub fn as_str(&self) -> &str {
        match self {
            DrcSubtarget::ZX48K => "48K",
            DrcSubtarget::ZX128K => "128K",
            DrcSubtarget::ZXPlus3 => "PLUS3",
            DrcSubtarget::ZXESXDOS => "ESXDOS",
            DrcSubtarget::ZXUno => "UNO",
            DrcSubtarget::ZXNext => "NEXT",
            DrcSubtarget::PCVGA256 => "VGA256",
            DrcSubtarget::PCVGA => "VGA",
            DrcSubtarget::PCEGA => "EGA",
            DrcSubtarget::PCCGA => "CGA",
            DrcSubtarget::PCTEXT => "TEXT",
            DrcSubtarget::MSX2Mode(mode) => mode,
        }
    }
}

/// DAAD Launcher - compiles and runs DAAD games
pub struct DaadLauncher {
    drc_path: PathBuf,
}

impl DaadLauncher {
    /// Create a new launcher with the path to the DRC executable
    pub fn new(drc_path: PathBuf) -> Self {
        Self { drc_path }
    }

    /// Auto-detect DRC in common locations
    pub fn auto_detect() -> LauncherResult<Self> {
        // Try common locations
        let candidates = vec![
            PathBuf::from("../external/DRC/src/drc"),
            PathBuf::from("./external/DRC/src/drc"),
            PathBuf::from("/usr/local/bin/drc"),
            PathBuf::from("/usr/bin/drc"),
        ];

        for path in candidates {
            if path.exists() {
                return Ok(Self::new(path));
            }
        }

        Err(LauncherError::DrcNotFound(
            "DRC compiler not found in common locations".to_string(),
        ))
    }

    /// Verify that DRC exists and is executable
    pub fn verify(&self) -> LauncherResult<bool> {
        if !self.drc_path.exists() {
            return Err(LauncherError::DrcNotFound(
                self.drc_path.display().to_string(),
            ));
        }

        // Try running DRC with no arguments (should show help)
        match Command::new(&self.drc_path).output() {
            Ok(_) => Ok(true),
            Err(e) => Err(LauncherError::IoError(e)),
        }
    }

    /// Compile a .SCE file to .JSON using DRC
    ///
    /// # Arguments
    /// * `sce_path` - Path to the .sce source file
    /// * `target` - Target platform (ZX, CPC, etc.)
    /// * `subtarget` - Optional subtarget (for ZX, MSX2, PC)
    /// * `output_path` - Optional output path (defaults to same name with .json extension)
    ///
    /// # Returns
    /// Path to the generated .json file
    pub fn compile_sce(
        &self,
        sce_path: &Path,
        target: DrcTarget,
        subtarget: Option<DrcSubtarget>,
        output_path: Option<PathBuf>,
    ) -> LauncherResult<PathBuf> {
        // Verify input file exists
        if !sce_path.exists() {
            return Err(LauncherError::InvalidPath(
                format!("Input file not found: {}", sce_path.display())
            ));
        }

        // Determine output path
        let output = output_path.unwrap_or_else(|| {
            sce_path.with_extension("json")
        });

        // Build DRC command
        let mut cmd = Command::new(&self.drc_path);
        cmd.arg(target.as_str());

        // Add subtarget if needed
        if target.needs_subtarget() {
            if let Some(st) = subtarget {
                cmd.arg(st.as_str());
            } else {
                // Use default subtargets
                match target {
                    DrcTarget::ZXSpectrum => cmd.arg("PLUS3"),
                    DrcTarget::PC => cmd.arg("VGA"),
                    DrcTarget::MSX2 => cmd.arg("5_8"),
                    _ => &mut cmd,
                };
            }
        }

        // Add input and output files
        cmd.arg(sce_path);
        cmd.arg(&output);

        // Capture output
        cmd.stdout(Stdio::piped());
        cmd.stderr(Stdio::piped());

        // Execute DRC
        let result = cmd.output()?;

        if !result.status.success() {
            let stderr = String::from_utf8_lossy(&result.stderr).to_string();
            let exit_code = result.status.code().unwrap_or(-1);
            return Err(LauncherError::CompilationFailed { stderr, exit_code });
        }

        // Verify output file was created
        if !output.exists() {
            return Err(LauncherError::CompilationFailed {
                stderr: "DRC reported success but output file not created".to_string(),
                exit_code: 0,
            });
        }

        Ok(output)
    }

    /// Get compilation output (stdout + stderr)
    pub fn compile_sce_with_output(
        &self,
        sce_path: &Path,
        target: DrcTarget,
        subtarget: Option<DrcSubtarget>,
        output_path: Option<PathBuf>,
    ) -> LauncherResult<(PathBuf, CompilationOutput)> {
        // Build command (same as compile_sce)
        let output_file = output_path.clone().unwrap_or_else(|| {
            sce_path.with_extension("json")
        });

        let mut cmd = Command::new(&self.drc_path);
        cmd.arg(target.as_str());

        if target.needs_subtarget() {
            if let Some(st) = subtarget {
                cmd.arg(st.as_str());
            } else {
                match target {
                    DrcTarget::ZXSpectrum => cmd.arg("PLUS3"),
                    DrcTarget::PC => cmd.arg("VGA"),
                    DrcTarget::MSX2 => cmd.arg("5_8"),
                    _ => &mut cmd,
                };
            }
        }

        cmd.arg(sce_path);
        cmd.arg(&output_file);
        cmd.stdout(Stdio::piped());
        cmd.stderr(Stdio::piped());

        let result = cmd.output()?;

        let compilation_output = CompilationOutput {
            stdout: String::from_utf8_lossy(&result.stdout).to_string(),
            stderr: String::from_utf8_lossy(&result.stderr).to_string(),
            exit_code: result.status.code().unwrap_or(-1),
            success: result.status.success(),
        };

        if !result.status.success() {
            return Err(LauncherError::CompilationFailed {
                stderr: compilation_output.stderr.clone(),
                exit_code: compilation_output.exit_code,
            });
        }

        Ok((output_file, compilation_output))
    }

    /// Launch a compiled DAAD game
    /// Note: This requires a DAAD interpreter to be available
    pub fn launch_game(&self, json_path: &Path) -> LauncherResult<()> {
        // TODO: Implement game launching with DAAD interpreter
        // For now, just open the JSON file location
        println!("Game compiled to: {}", json_path.display());
        println!("To play, use a DAAD interpreter with the .json file");
        Ok(())
    }

    /// One-step build and test: Generate .SCE → Compile → Launch
    pub fn build_and_test(
        &self,
        sce_path: &Path,
        target: DrcTarget,
    ) -> LauncherResult<PathBuf> {
        // Compile
        let json_path = self.compile_sce(sce_path, target, None, None)?;

        // Launch (currently just shows path)
        self.launch_game(&json_path)?;

        Ok(json_path)
    }
}

/// Compilation output info
#[derive(Debug, Clone)]
pub struct CompilationOutput {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
    pub success: bool,
}

impl CompilationOutput {
    pub fn combined_output(&self) -> String {
        format!("{}\n{}", self.stdout, self.stderr)
    }

    pub fn has_warnings(&self) -> bool {
        self.stdout.contains("warning") || self.stderr.contains("warning")
    }

    pub fn has_errors(&self) -> bool {
        !self.success || self.stderr.contains("error") || self.stderr.contains("Error")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_target_strings() {
        assert_eq!(DrcTarget::ZXSpectrum.as_str(), "ZX");
        assert_eq!(DrcTarget::AmstradCPC.as_str(), "CPC");
        assert_eq!(DrcTarget::Commodore64.as_str(), "C64");
    }

    #[test]
    fn test_subtarget_needed() {
        assert!(DrcTarget::ZXSpectrum.needs_subtarget());
        assert!(!DrcTarget::AmstradCPC.needs_subtarget());
    }
}
