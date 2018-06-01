## Systemd Files

These files expect this repo checkout out to /opt/cimis-mobile.  Then symlink to ```/etc/systemd/system```

Next, tell systemd to start on boot

```
> sudo systemctl enable /opt/cimis-mobile/docker/systemd/cimis-mobile.service
```

Then

```bash
> sudo systemctl [start|stop] cimis-mobile
```
