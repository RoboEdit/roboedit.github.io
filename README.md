# RoboEdit project page

Academic project page for **RoboEdit: Turning Human Manipulation Videos into Scalable Robot Experience**.

## Preview locally

Run from this directory:

```bash
python -m http.server 8001
```

Then open <http://127.0.0.1:8001/>.

## Ground-truth sources

- Main manuscript: the public arXiv preprint ([arXiv:2608.18948](https://arxiv.org/abs/2608.18948)) and the matching local TeX/PDF source.
- Supplement: final supplementary PDF and TeX.
- Figures and video walls: the teaser, RoboEdit-Trans, and RoboEdit-ADC remain paper figures. RoboEdit-14M uses a three-page paired-video wall, while the decoder method block presents six looping decoded-state videos in a 2×3 layout. Detailed comparisons and ablations remain in the paper.
- Videos: the final submission bundle. The page contains 24 RoboEdit cases × 4 streams and 8 real-robot cases × 2 streams, for 112 MP4 files in total.
- The public-facing `3D Robot-State Decoder` description follows the paper-final Formal353 architecture: edited-RGB-only, shared ResNet-34 FPN, robot-specific spatial heads, SQPnP wrist recovery, full-81-frame temporal Transformer, and forward kinematics. V169 is not presented as the paper decoder.

## Publication status

The title, author list, submission date, paper links, metadata, and BibTeX entry follow the public arXiv record for `2608.18948`. The page contains no anonymous-submission or AAAI venue label.

## Media behavior

All 24 four-stream RoboEdit comparisons and all eight real-robot cases load by default, for 112 videos on the main page. The 24 editing cases use synchronized source/ADC copies under `static/videos/RoboEdit_results_synced`: every stream is exactly 81 frames at 24 FPS (3.37 seconds). The real-robot task references and rollouts intentionally keep their independent durations; “Play together” starts both at zero without forcing the longer rollout to follow the short reference timeline. Videos play muted when visible and pause off-screen. The standalone 112-video viewer is preserved at `static/videos/original_multimedia_viewer.html` and uses the same media.

## Credits

The page uses the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template) as its structural base and follows the restrained presentation style of [Nerfies](https://nerfies.github.io/). Template code is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); paper figures and videos remain subject to the authors' terms.
