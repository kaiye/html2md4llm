"""Dify Plugin Entry Point for html2md4llm"""

# This is the entry point for Dify plugin execution
# Dify will import and use this module

import sys
from pathlib import Path

# Add plugin directory to path so we can import lib
plugin_dir = Path(__file__).parent
sys.path.insert(0, str(plugin_dir))

from lib import main

__all__ = ['main']
