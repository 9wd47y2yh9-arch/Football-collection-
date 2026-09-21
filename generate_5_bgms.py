#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import math
import struct
import wave
import subprocess
import os

SAMPLE_RATE = 44100

def create_track(filename, title, bpm, base_freqs, chord_prog, duration=16.0):
    total_samples = int(SAMPLE_RATE * duration)
    wav_path = f"/tmp/{filename}.wav"
    mp3_path = f"public/audio/{filename}.mp3"
    
    beat_sec = 60.0 / bpm
    step_sec = beat_sec / 4.0 # 16th notes
    
    with wave.open(wav_path, 'wb') as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        
        frames = bytearray()
        
        for i in range(total_samples):
            t = i / SAMPLE_RATE
            step = int(t / step_sec)
            beat = int(t / beat_sec)
            
            # Chord index
            chord_idx = (beat // 4) % len(chord_prog)
            root_freq, third_freq, fifth_freq = chord_prog[chord_idx]
            
            # 1. Bassline (saw/square mix with decay)
            step_pos = (t % (step_sec * 2)) / (step_sec * 2)
            bass_env = math.exp(-step_pos * 4.0)
            bass = (math.sin(2 * math.pi * root_freq * 0.5 * t) + 
                    0.5 * math.sin(2 * math.pi * root_freq * t)) * bass_env * 0.35
            
            # 2. Kick drum on beats (4-on-the-floor or syncopated)
            beat_pos = (t % beat_sec) / beat_sec
            kick_env = math.exp(-beat_pos * 18.0)
            kick_freq = 140.0 * math.exp(-beat_pos * 22.0) + 42.0
            kick = math.sin(2 * math.pi * kick_freq * t) * kick_env * 0.5
            
            # 3. Snare on beats 2 and 4 (or 1 and 3)
            snare = 0.0
            if beat % 2 == 1:
                snare_pos = (t % beat_sec) / beat_sec
                if snare_pos < 0.18:
                    noise = ((math.sin(t * 12345.67) + math.sin(t * 87654.32)) % 1.0) - 0.5
                    snare_env = math.exp(-snare_pos * 20.0)
                    snare = (noise * 0.6 + math.sin(2 * math.pi * 220 * t) * 0.4) * snare_env * 0.35
            
            # 4. Hi-hat on off-beats
            hihat = 0.0
            hihat_step = int(t / (step_sec * 2))
            hihat_pos = (t % (step_sec * 2)) / (step_sec * 2)
            if hihat_pos < 0.08:
                noise = ((math.sin(t * 99999.0) + math.sin(t * 44444.0)) % 1.0) - 0.5
                hihat = noise * math.exp(-hihat_pos * 35.0) * 0.15
            
            # 5. Lead melody arpeggio
            arp_note = [root_freq, third_freq, fifth_freq, root_freq * 2][step % 4]
            lead_pos = (t % step_sec) / step_sec
            lead_env = math.exp(-lead_pos * 3.5)
            lead = math.sin(2 * math.pi * arp_note * t) * lead_env * 0.22
            
            # 6. Pad chords
            pad = (math.sin(2 * math.pi * root_freq * t) +
                   math.sin(2 * math.pi * third_freq * t) +
                   math.sin(2 * math.pi * fifth_freq * t)) * 0.08
            
            # Mix
            left = (kick + snare + bass + hihat + lead * 0.8 + pad * 0.9)
            right = (kick + snare + bass + hihat + lead * 0.9 + pad * 0.8)
            
            # Limiter / soft clipping
            left = max(-0.95, min(0.95, left))
            right = max(-0.95, min(0.95, right))
            
            left_int = int(left * 32767)
            right_int = int(right * 32767)
            
            frames += struct.pack('<hh', left_int, right_int)
        
        wav.writeframes(frames)
    
    # Convert to MP3 using ffmpeg
    subprocess.run([
        'ffmpeg', '-y', '-i', wav_path,
        '-codec:a', 'libmp3lame', '-b:a', '128k',
        mp3_path
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    print(f"Created {mp3_path} ({title})")
    
    # Also copy to dist if dist/audio exists
    if os.path.exists("dist/audio"):
        subprocess.run(['cp', mp3_path, f"dist/audio/{filename}.mp3"])

os.makedirs("public/audio", exist_ok=True)
if os.path.exists("dist"):
    os.makedirs("dist/audio", exist_ok=True)

# 1. BGM 1: Change The Game (Driving Anthem, 128 BPM, F minor - Ab - Eb - Bb)
create_track("bgm1", "Change The Game", 128, [174.61, 207.65, 155.56, 116.54], [
    (174.61, 207.65, 261.63), # Fm
    (207.65, 261.63, 311.13), # Ab
    (155.56, 196.00, 233.08), # Eb
    (233.08, 293.66, 349.23), # Bb
])

# 2. BGM 2: Ace of the Arena (Uplifting Euphoria, 125 BPM, C major - G - Am - F)
create_track("bgm2", "Ace of the Arena", 125, [261.63, 196.00, 220.00, 174.61], [
    (261.63, 329.63, 392.00), # C
    (196.00, 246.94, 293.66), # G
    (220.00, 261.63, 329.63), # Am
    (174.61, 220.00, 261.63), # F
])

# 3. BGM 3: The New Regime (Cyberpunk Tech Groove, 130 BPM, D minor - Bb - C - Gm)
create_track("bgm3", "The New Regime", 130, [146.83, 116.54, 130.81, 98.00], [
    (146.83, 174.61, 220.00), # Dm
    (233.08, 293.66, 349.23), # Bb
    (261.63, 329.63, 392.00), # C
    (196.00, 233.08, 293.66), # Gm
])

# 4. BGM 4: Pack Unfolds (Dramatic Arpeggio Tension, 122 BPM, A minor - F - C - G)
create_track("bgm4", "Pack Unfolds", 122, [220.00, 174.61, 261.63, 196.00], [
    (220.00, 261.63, 329.63), # Am
    (174.61, 220.00, 261.63), # F
    (261.63, 329.63, 392.00), # C
    (196.00, 246.94, 293.66), # G
])

# 5. BGM 5: The Final Pull (Triumphant Climax Anthem, 132 BPM, E minor - C - G - D)
create_track("bgm5", "The Final Pull", 132, [164.81, 130.81, 196.00, 146.83], [
    (164.81, 196.00, 246.94), # Em
    (261.63, 329.63, 392.00), # C
    (196.00, 246.94, 293.66), # G
    (146.83, 185.00, 220.00), # D
])

print("All 5 BGM tracks successfully synthesized and converted to MP3!")
