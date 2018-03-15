#! /bin/sh
### BEGIN INIT INFO
# Provides:		cimis-mobile
# Required-Start:	$redis-server
# Required-Stop:	$redis-server
# Default-Start:	2 3 4 5
# Default-Stop:		0 1 6
# Short-Description:	cimis-mobile - CIMIS data application server
# Description:		cimis-mobile - Provides an http application to serve CIMIS data
### END INIT INFO


PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
DAEMON=/usr/bin/nodejs
DAEMON_ARGS=/etc/cimis-mobile/cimis-mobile.conf
NAME=cimis-mobile
DESC=cimis-mobile

RUNDIR=/var/run/cimis-mobile
PIDFILE=$RUNDIR/cimis-mobile.pid

test -x $DAEMON || exit 0

if [ -r /etc/default/$NAME ]
then
	. /etc/default/$NAME
fi

. /lib/lsb/init-functions

set -e

case "$1" in
  start)
	echo -n "Starting $DESC: "
	mkdir -p $RUNDIR
	touch $PIDFILE
	chown redis:redis $RUNDIR $PIDFILE
	chmod 755 $RUNDIR

	if start-stop-daemon --start --quiet --umask 007 --pidfile $PIDFILE --chuid redis:redis --exec $DAEMON -- $DAEMON_ARGS
	then
		echo "$NAME."
	else
		echo "failed"
	fi
	;;
  stop)
	echo -n "Stopping $DESC: "
	if start-stop-daemon --stop --retry forever/TERM/1 --quiet --oknodo --pidfile $PIDFILE --exec $DAEMON
	then
		echo "$NAME."
	else
		echo "failed"
	fi
	rm -f $PIDFILE
	sleep 1
	;;

  restart|force-reload)
	${0} stop
	${0} start
	;;

  status)
	status_of_proc -p ${PIDFILE} ${DAEMON} ${NAME}
	;;

  *)
	echo "Usage: /etc/init.d/$NAME {start|stop|restart|force-reload|status}" >&2
	exit 1
	;;
esac

exit 0
