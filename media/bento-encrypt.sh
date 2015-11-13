# Note: Video track has track id 1, audio has track id 2.

# Extract audio/video tracks into separate fragmented files.
mp4fragment --track video sintel_trailer-720p.mp4 sintel_trailer-720p-video-fragmented.mp4
mp4fragment --track audio sintel_trailer-720p.mp4 sintel_trailer-720p-audio-fragmented.mp4

# Encrypt each track with a different key.
mp4encrypt --method MPEG-CENC --key 1:7f412f0575f44f718259beef56ec7771:0a8d9e58502141c3 --property 1:KID:2fef8ad812df429783e9bf6e5e493e53  --global-option mpeg-cenc.eme-pssh:true sintel_trailer-720p-video-fragmented.mp4 sintel_trailer-720p-video-fragmented-cenc.mp4
 
mp4encrypt --method MPEG-CENC --key 2:624db3d757bb496fb93e51f341d11716:bf07e864e27643a0 --property 2:KID:7eaa636ee7d142fd945d1f764877d8db --global-option mpeg-cenc.eme-pssh:true sintel_trailer-720p-audio-fragmented.mp4 sintel_trailer-720p-audio-fragmented-cenc.mp4

# Split fragmented files into chunks.
# Note: This produces files that work in Firefox but not Chrome, so don't use it.
#mp4split.exe --start-number 1 --media-segment audio-%02llu.mp4 --init-segment audio-00-init.mp4 --track-id 2 --pattern-parameters N sintel_trailer-720p-audio-fragmented-cenc.mp4
#mp4split.exe --start-number 1 --media-segment video-%02llu.mp4 --init-segment video-00-init.mp4 --track-id 1 --pattern-parameters N sintel_trailer-720p-video-fragmented-cenc.mp4

# use mp4-dash.py from Bento; it outputs fragments that are decodable by Chrome.
python ~/Downloads/Bento4-SDK-1-4-3-603.x86-microsoft-win32-vs2010/Bento4-SDK-1-4-3-603.x86-microsoft-win32-vs2010/utils/mp4-dash.py -f -o fragments sintel_trailer-720p-audio-fragmented-cenc.mp4
python ~/Downloads/Bento4-SDK-1-4-3-603.x86-microsoft-win32-vs2010/Bento4-SDK-1-4-3-603.x86-microsoft-win32-vs2010/utils/mp4-dash.py -f -o fragments sintel_trailer-720p-video-fragmented-cenc.mp4

rm -rf audio
rm -rf video
mv fragments/audio/und audio
mv fragments/video/1 video
rm -rf fragments/

for f in audio/*.m4f; do mv "$f" "`echo $f | sed s/m4f/mp4/`"; done
for f in video/*.m4f; do mv "$f" "`echo $f | sed s/m4f/mp4/`"; done