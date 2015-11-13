mp4fragment --track audio sintel_trailer-720p.mp4 sintel_trailer-720p-audio-fragmented.mp4
mp4fragment --track video sintel_trailer-720p.mp4 sintel_trailer-720p-video-fragmented.mp4

mp4encrypt --method MPEG-CENC --key 1:7f412f0575f44f718259beef56ec7771:0a8d9e58502141c3 --property 1:KID:2fef8ad812df429783e9bf6e5e493e53  --global-option mpeg-cenc.eme-pssh:true sintel_trailer-720p-video-fragmented.mp4 sintel_trailer-720p-video-fragmented-cenc.mp4
 
mp4encrypt --method MPEG-CENC --key 2:624db3d757bb496fb93e51f341d11716:bf07e864e27643a0 --property 2:KID:7eaa636ee7d142fd945d1f764877d8db --global-option mpeg-cenc.eme-pssh:true sintel_trailer-720p-audio-fragmented.mp4 sintel_trailer-720p-audio-fragmented-cenc.mp4
 
mp4split.exe --init-segment audio-00-init.mp4 --media-segment audio-%02llu.mp4 --pattern-parameters N sintel_trailer-720p-audio-fragmented-cenc.mp4

mp4split.exe --init-segment video-00-init.mp4 --media-segment video-%02llu.mp4 --pattern-parameters N sintel_trailer-720p-video-fragmented-cenc.mp4
 
